import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  cards,
  createDb,
  drawPool,
  drawPoolCounts,
  games,
  packTypes,
  series,
  type Db,
} from '@pixpedia/db';
import { DEFAULT_PACK_ODDS, DEFAULT_RARITY_PARAMS, type Rarity } from '@pixpedia/shared';
import { buildApp } from './app';

const url = process.env.TEST_DATABASE_URL;
const MIN = 60_000;

/** Pool de test : aucun Hall of Fame, pour vérifier la descente de rareté. */
const POOL: [Rarity, number][] = [
  ['starter', 12],
  ['bonus', 6],
  ['combo', 4],
  ['boss', 3],
  ['final', 2],
];

describe.skipIf(!url)('API joueur (intégration, TEST_DATABASE_URL)', () => {
  let db: Db;
  let end: () => Promise<void>;
  let app: Awaited<ReturnType<typeof buildApp>>;
  let now = new Date('2026-10-13T12:00:00Z');
  let counter = 0;
  /** Par défaut : rareté la plus basse de chaque emplacement, cartes qui défilent dans le pool. */
  let rng: (max: number) => number = (max) => (max === 10_000 ? 0 : counter++ % max);
  let packTypeId = 0;

  beforeAll(async () => {
    const created = createDb(url);
    db = created.db;
    end = () => created.pool.end();
    await migrate(db, {
      migrationsFolder: fileURLToPath(new URL('../../../packages/db/drizzle', import.meta.url)),
    });
    await db.execute(
      sql`truncate users, events, draw_pool, draw_pool_counts, pack_types, cards, series, games restart identity cascade`,
    );

    let id = 0;
    const [s] = await db
      .insert(series)
      .values({ code: 'T0', name: 'Test', rarityParams: DEFAULT_RARITY_PARAMS })
      .returning();
    const [type] = await db
      .insert(packTypes)
      .values({ code: 'standard', name: 'Pack standard', odds: DEFAULT_PACK_ODDS })
      .returning();
    packTypeId = type!.id;
    for (const [rarity, n] of POOL) {
      for (let i = 1; i <= n; i++) {
        id++;
        await db.insert(games).values({ id, name: `Jeu ${rarity} ${i}`, slug: `jeu-${id}` });
        const [card] = await db
          .insert(cards)
          .values({
            seriesId: s!.id,
            gameId: id,
            number: id,
            rarity,
            scoreAtPrint: 0,
            atk: 50,
            def: 50,
            hp: 50,
            spd: 50,
            family: 'action',
          })
          .returning();
        await db.insert(drawPool).values({ packTypeId, rarity, idx: i, cardId: card!.id });
      }
      await db.insert(drawPoolCounts).values({ packTypeId, rarity, n });
    }

    app = await buildApp({
      db,
      rateLimit: false,
      cookieSecure: false,
      pack: { max: 10, regenMs: 5 * MIN },
      randomInt: (max) => rng(max),
      now: () => now,
    });
  });

  afterAll(async () => {
    await app?.close();
    await end?.();
  });

  beforeEach(async () => {
    await db.execute(sql`truncate users restart identity cascade`);
    now = new Date('2026-10-13T12:00:00Z');
    counter = 0;
    rng = (max) => (max === 10_000 ? 0 : counter++ % max);
  });

  const account = {
    username: 'Link_64',
    email: 'link@hyrule.fr',
    password: 'triforce-courage',
    countryCode: 'FR',
    ageConfirmed: true,
  };

  async function register(body = account): Promise<string> {
    const res = await app.inject({ method: 'POST', url: '/auth/register', payload: body });
    expect(res.statusCode).toBe(201);
    const cookie = res.cookies.find((c) => c.name === 'pixpedia_session');
    expect(cookie?.httpOnly).toBe(true);
    return `pixpedia_session=${cookie!.value}`;
  }

  /**
   * Ouvre puis révèle tout, comme « Tout révéler » côté front : la réponse d'ouverture ne
   * contient aucune carte (règle anti-fuite), on les ajoute pour les assertions.
   */
  async function withReveal(res: Awaited<ReturnType<typeof app.inject>>, cookie: string) {
    if (res.statusCode !== 200) return res;
    const body = res.json();
    const all = await app.inject({
      method: 'POST',
      url: `/packs/openings/${body.openingId}/reveal-all`,
      headers: { cookie },
    });
    const merged = { ...body, cards: all.json().cards };
    return { statusCode: res.statusCode, json: () => merged, raw: body };
  }

  const open = async (cookie: string, key = randomUUID(), id = packTypeId) =>
    withReveal(
      await app.inject({
        method: 'POST',
        url: '/packs/open',
        headers: { cookie },
        payload: { packTypeId: id, idempotencyKey: key },
      }),
      cookie,
    );

  const me = async (cookie: string) =>
    (await app.inject({ url: '/me', headers: { cookie } })).json();

  describe('comptes', () => {
    it('inscrit un joueur avec 10 packs et des monnaies à zéro', async () => {
      const cookie = await register();
      expect(await me(cookie)).toMatchObject({
        username: 'Link_64',
        countryCode: 'FR',
        emailVerified: false,
        packsAvailable: 10,
        nextPackAt: null,
        shards: 0,
        coins: 0,
      });
      const [row] = (
        await db.execute<{ password_hash: string }>(sql`select password_hash from users`)
      ).rows;
      expect(row!.password_hash).toMatch(/^\$argon2id\$/);
    });

    it('refuse un pseudo ou un email déjà pris, sans tenir compte de la casse', async () => {
      await register();
      const dupName = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { ...account, email: 'autre@hyrule.fr', username: 'LINK_64' },
      });
      expect(dupName.json()).toEqual({ error: 'username_taken' });
      const dupMail = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { ...account, username: 'Zelda', email: 'LINK@hyrule.fr' },
      });
      expect(dupMail.statusCode).toBe(409);
    });

    it('refuse une inscription sans la case des 15 ans', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { ...account, ageConfirmed: false },
      });
      expect(res.statusCode).toBe(400);
    });

    it('connecte, refuse un mauvais mot de passe, déconnecte', async () => {
      await register();
      const bad = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: account.email, password: 'mauvais-mdp' },
      });
      expect(bad.statusCode).toBe(401);
      const unknown = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'inconnu@x.fr', password: 'peu-importe' },
      });
      expect(unknown.json()).toEqual({ error: 'invalid_credentials' });

      const ok = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'LINK@hyrule.fr', password: account.password },
      });
      expect(ok.statusCode).toBe(200);
      const cookie = `pixpedia_session=${ok.cookies.find((c) => c.name === 'pixpedia_session')!.value}`;
      expect((await app.inject({ url: '/me', headers: { cookie } })).statusCode).toBe(200);

      await app.inject({ method: 'POST', url: '/auth/logout', headers: { cookie } });
      expect((await app.inject({ url: '/me', headers: { cookie } })).statusCode).toBe(401);
    });

    it('pose le cookie de session sur le chemin configuré (/pixpedia/ en prod)', async () => {
      const prod = await buildApp({
        db,
        rateLimit: false,
        cookieSecure: true,
        cookiePath: '/pixpedia/',
      });
      const res = await prod.inject({ method: 'POST', url: '/auth/register', payload: account });
      await prod.close();
      const cookie = res.cookies.find((c) => c.name === 'pixpedia_session');
      expect(cookie).toMatchObject({
        path: '/pixpedia/',
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
      });
    });

    it('limite les inscriptions à 5 par heure et par IP', async () => {
      const limited = await buildApp({ db, cookieSecure: false });
      const codes: number[] = [];
      for (let i = 0; i < 6; i++) {
        const res = await limited.inject({
          method: 'POST',
          url: '/auth/register',
          payload: { ...account, username: `joueur${i}`, email: `j${i}@x.fr` },
        });
        codes.push(res.statusCode);
      }
      await limited.close();
      expect(codes).toEqual([201, 201, 201, 201, 201, 429]);
    });

    it('protège les routes joueur', async () => {
      expect((await app.inject({ url: '/me' })).statusCode).toBe(401);
      expect((await app.inject({ url: '/collection' })).statusCode).toBe(401);
      const res = await app.inject({
        method: 'POST',
        url: '/packs/open',
        payload: { packTypeId, idempotencyKey: randomUUID() },
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('ouverture de pack', () => {
    it('donne 5 cartes différentes, libres, et consomme un pack', async () => {
      const cookie = await register();
      const res = await open(cookie);
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.cards).toHaveLength(5);
      expect(new Set(body.cards.map((c: { cardId: number }) => c.cardId)).size).toBe(5);
      expect(body.cards.map((c: { rarity: string }) => c.rarity)).toEqual([
        'starter',
        'starter',
        'starter',
        'bonus',
        'combo',
      ]);
      expect(body.cards.every((c: { isNew: boolean }) => c.isNew)).toBe(true);
      expect(body.cards[0]).toMatchObject({
        rarityLabel: 'Starter',
        cost: 1,
        familyLabel: 'Action',
        atk: 50,
      });
      expect(body).toMatchObject({ packsAvailable: 9, pityCounter: 1, replayed: false });
      expect(new Date(body.nextPackAt).getTime()).toBe(now.getTime() + 5 * MIN);

      const bound = await db.execute(sql`select count(*)::int n from user_cards where is_bound`);
      expect(bound.rows[0]).toEqual({ n: 0 });
    });

    it('rejoue la même clé sans tirer de nouveau (double clic)', async () => {
      const cookie = await register();
      const key = randomUUID();
      const first = (await open(cookie, key)).json();
      const second = (await open(cookie, key)).json();
      expect(second.replayed).toBe(true);
      expect(second.cards.map((c: { cardId: number }) => c.cardId)).toEqual(
        first.cards.map((c: { cardId: number }) => c.cardId),
      );
      expect(second.packsAvailable).toBe(9);
      const total = await db.execute(sql`select sum(quantity)::int n from user_cards`);
      expect(total.rows[0]).toEqual({ n: 5 });
    });

    it('bloque à 0 pack puis recharge 1 pack toutes les 5 minutes', async () => {
      const cookie = await register();
      for (let i = 0; i < 10; i++) expect((await open(cookie)).statusCode).toBe(200);
      const empty = await open(cookie);
      expect(empty.statusCode).toBe(409);
      expect(empty.json()).toEqual({ error: 'no_packs_available' });

      now = new Date(now.getTime() + 5 * MIN);
      expect((await me(cookie)).packsAvailable).toBe(1);
      expect((await open(cookie)).statusCode).toBe(200);
    });

    it('garantit un Boss au 11e pack après 10 packs sans Boss', async () => {
      const cookie = await register();
      for (let i = 0; i < 10; i++) await open(cookie);
      expect((await me(cookie)).pityCounter).toBe(10);
      now = new Date(now.getTime() + 5 * MIN);
      const body = (await open(cookie)).json();
      expect(body.cards[4].rarity).toBe('boss');
      expect(body.pityCounter).toBe(0);
    });

    it('descend d’une rareté quand le pool est vide (aucun Hall of Fame)', async () => {
      const cookie = await register();
      rng = (max) => (max === 10_000 ? 9_999 : counter++ % max);
      const body = (await open(cookie)).json();
      expect(body.cards[4].rarity).toBe('final');
      expect(body.pityCounter).toBe(0);
    });

    it('marque comme non nouvelles les cartes déjà possédées', async () => {
      const cookie = await register();
      await open(cookie);
      counter = 0;
      const body = (await open(cookie)).json();
      expect(body.cards.every((c: { isNew: boolean }) => !c.isNew)).toBe(true);
    });

    it('sérialise deux ouvertures simultanées : le dernier pack ne sort qu’une fois', async () => {
      const cookie = await register();
      for (let i = 0; i < 9; i++) await open(cookie);
      const results = await Promise.all([open(cookie), open(cookie)]);
      expect(results.map((r) => r.statusCode).sort()).toEqual([200, 409]);
      const n = await db.execute(sql`select count(*)::int n from pack_openings`);
      expect(n.rows[0]).toEqual({ n: 10 });
    });

    it('refuse un pack inconnu ou une clé invalide', async () => {
      const cookie = await register();
      const unknown = await app.inject({
        method: 'POST',
        url: '/packs/open',
        headers: { cookie },
        payload: { packTypeId: 999, idempotencyKey: randomUUID() },
      });
      expect(unknown.statusCode).toBe(404);
      const badKey = await app.inject({
        method: 'POST',
        url: '/packs/open',
        headers: { cookie },
        payload: { packTypeId, idempotencyKey: '123' },
      });
      expect(badKey.statusCode).toBe(400);
    });

    it('publie les taux de drop', async () => {
      const body = (await app.inject({ url: '/packs' })).json();
      expect(body.packs[0]).toMatchObject({ code: 'standard', cost: 0 });
      expect(body.packs[0].odds[4]).toEqual({ combo: 70, boss: 22, final: 7, hof: 1 });
    });
  });

  describe('détail d’une carte', () => {
    it('renvoie la vue complète, avec l’attribution IGDB', async () => {
      const res = await app.inject({ url: '/cards/1' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toMatchObject({
        cardId: 1,
        number: '#0001',
        seriesCode: 'T0',
        rarity: 'starter',
        rarityLabel: 'Starter',
        cost: 1,
        platform: null,
        igdbUrl: 'https://www.igdb.com/games/jeu-1',
        owned: [],
      });
    });

    it('indique les exemplaires possédés par le joueur connecté', async () => {
      const cookie = await register();
      const first = (await open(cookie)).json().cards[0];
      expect(first).toMatchObject({ number: expect.stringMatching(/^#\d{4}$/), seriesCode: 'T0' });
      const res = (await app.inject({ url: `/cards/${first.cardId}`, headers: { cookie } })).json();
      expect(res.owned).toEqual([
        expect.objectContaining({ finish: first.finish, isBound: false, quantity: 1 }),
      ]);
    });

    it('cache un jeu sorti du catalogue à ceux qui ne le possèdent pas', async () => {
      await db.execute(sql`update games set status = 'quarantine' where id = 2`);
      expect((await app.inject({ url: '/cards/2' })).statusCode).toBe(404);
      await db.execute(sql`update games set status = 'eligible' where id = 2`);
      expect((await app.inject({ url: '/cards/abc' })).statusCode).toBe(400);
      expect((await app.inject({ url: '/cards/99999' })).statusCode).toBe(404);
    });
  });

  describe('éclats', () => {
    it('recycle les doublons en éclats, en gardant un exemplaire', async () => {
      const cookie = await register();
      await open(cookie);
      counter = 0;
      await open(cookie); // mêmes cartes : 5 doublons (3 Starter, 1 Bonus, 1 Combo)

      const preview = (
        await app.inject({ url: '/collection/duplicates', headers: { cookie } })
      ).json();
      expect(preview).toEqual({ copies: 5, shards: 3 * 1 + 3 + 10 });

      const res = await app.inject({
        method: 'POST',
        url: '/cards/recycle-duplicates',
        headers: { cookie },
      });
      expect(res.json()).toEqual({ copies: 5, shardsGained: 16, shards: 16 });
      expect((await me(cookie)).shards).toBe(16);
      const q = await db.execute(
        sql`select sum(quantity)::int n, count(*)::int rows from user_cards`,
      );
      expect(q.rows[0]).toEqual({ n: 5, rows: 5 });
      const ledger = await db.execute(
        sql`select sum(delta)::int s from currency_ledger where reason = 'recycle'`,
      );
      expect(ledger.rows[0]).toEqual({ s: 16 });
    });

    it('refuse de recycler le dernier exemplaire ou une carte liée', async () => {
      const cookie = await register();
      const card = (await open(cookie)).json().cards[0];
      const last = await app.inject({
        method: 'POST',
        url: '/cards/recycle',
        headers: { cookie },
        payload: { cardId: card.cardId, finish: card.finish, quantity: 1 },
      });
      expect(last.json()).toEqual({ error: 'not_enough_duplicates' });

      await db.execute(sql`insert into user_cards (user_id, card_id, finish, is_bound, quantity)
        values (1, ${card.cardId}, 'normal', true, 5)`);
      const bound = await app.inject({
        method: 'POST',
        url: '/cards/recycle',
        headers: { cookie },
        payload: { cardId: card.cardId, finish: 'normal', quantity: 1 },
      });
      expect(bound.statusCode).toBe(409);
      expect(
        (await app.inject({ url: '/collection/duplicates', headers: { cookie } })).json(),
      ).toEqual({
        copies: 0,
        shards: 0,
      });
    });

    it('achète un pack standard en éclats quand le stock est vide (50 éclats)', async () => {
      const cookie = await register();
      for (let i = 0; i < 10; i++) await open(cookie);
      const pay = (shardsWanted: boolean) =>
        app.inject({
          method: 'POST',
          url: '/packs/open',
          headers: { cookie },
          payload: { packTypeId, idempotencyKey: randomUUID(), useShards: shardsWanted },
        });
      expect((await pay(true)).json()).toEqual({ error: 'not_enough_shards' });

      await db.execute(sql`update users set shards = 60`);
      const res = await pay(true);
      expect(res.statusCode).toBe(200);
      expect(res.json()).toMatchObject({ packsAvailable: 0, shards: 10 });
      const ledger = await db.execute(sql`select delta, reason from currency_ledger`);
      expect(ledger.rows).toEqual([{ delta: -50, reason: 'pack_purchase' }]);
      const bound = await db.execute(sql`select count(*)::int n from user_cards where is_bound`);
      expect(bound.rows[0]).toEqual({ n: 0 });
    });
  });

  describe('sets et packs thématiques', () => {
    beforeEach(async () => {
      await db.execute(sql`truncate set_cards, sets restart identity cascade`);
      await db.execute(sql`delete from pack_types where code = 'theme-bonus'`);
      // Set « Bonus » : les 6 cartes Bonus du pool de test (ids 13 à 18).
      await db.execute(sql`
        insert into sets (series_id, type, key, name, total) values (1, 'genre', 'bonus', 'Genre Bonus', 6);
        insert into set_cards select 1, id from cards where rarity = 'bonus';
      `);
    });

    it('liste les sets avec la progression du joueur', async () => {
      const cookie = await register();
      await open(cookie); // 1 carte Bonus
      const list = (await app.inject({ url: '/sets?type=genre', headers: { cookie } })).json();
      expect(list.sets).toEqual([
        { type: 'genre', key: 'bonus', name: 'Genre Bonus', total: 6, owned: 1 },
      ]);

      const summary = (await app.inject({ url: '/sets/summary', headers: { cookie } })).json();
      expect(summary.types).toEqual([{ type: 'genre', sets: 1, started: 1, completed: 0 }]);

      const anonymous = (await app.inject({ url: '/sets?type=genre' })).json();
      expect(anonymous.sets[0].owned).toBe(0);
    });

    it('détaille un set avec les cartes possédées et manquantes', async () => {
      const cookie = await register();
      await open(cookie);
      const detail = (await app.inject({ url: '/sets/genre/bonus', headers: { cookie } })).json();
      expect(detail).toMatchObject({ name: 'Genre Bonus', total: 6, owned: 1, matching: 6 });
      expect(detail.cards.filter((c: { owned: boolean }) => c.owned)).toHaveLength(1);

      const missing = (
        await app.inject({ url: '/sets/genre/bonus?missing=missing', headers: { cookie } })
      ).json();
      expect(missing.matching).toBe(5);
      expect(missing.cards.every((c: { owned: boolean }) => !c.owned)).toBe(true);
      expect((await app.inject({ url: '/sets/genre/inconnu' })).statusCode).toBe(404);
      expect((await app.inject({ url: '/sets?type=pays' })).statusCode).toBe(400);
    });

    it('un pack thématique tire dans son set, en remontant de rareté si besoin', async () => {
      const [themed] = (
        await db.execute<{ id: number }>(sql`
          insert into pack_types (code, name, filter, cost, odds)
          values ('theme-bonus', 'Pack Bonus', '{"set":{"type":"genre","key":"bonus"}}', 100,
                  ${JSON.stringify(DEFAULT_PACK_ODDS)}::jsonb)
          returning id`)
      ).rows;
      await db.execute(sql`
        insert into draw_pool (pack_type_id, rarity, idx, card_id)
        select ${themed!.id}, 'bonus', row_number() over (order by id), id from cards where rarity = 'bonus'
      `);
      await db.execute(sql`insert into draw_pool_counts values (${themed!.id}, 'bonus', 6)`);
      const cookie = await register();
      await db.execute(sql`update users set shards = 150`);
      const res = await open(cookie, randomUUID(), themed!.id);
      expect(res.statusCode).toBe(200);
      const body = res.json();
      // Starter et Combo tirés n'existent pas dans ce pool : on obtient des Bonus.
      expect(body.cards.map((c: { rarity: string }) => c.rarity)).toEqual(Array(5).fill('bonus'));
      expect(body).toMatchObject({ shards: 50, packsAvailable: 10 });
    });
  });

  describe('animations : réglages et annonces Hall of Fame', () => {
    it('enregistre l’option « Animations réduites » dans le profil', async () => {
      const cookie = await register();
      expect(await me(cookie)).toMatchObject({ reducedMotion: false, hofSeen: false });
      const res = await app.inject({
        method: 'PATCH',
        url: '/me/settings',
        headers: { cookie },
        payload: { reducedMotion: true },
      });
      expect(res.json()).toEqual({ reducedMotion: true });
      expect((await me(cookie)).reducedMotion).toBe(true);
      const bad = await app.inject({
        method: 'PATCH',
        url: '/me/settings',
        headers: { cookie },
        payload: { reducedMotion: 'oui' },
      });
      expect(bad.statusCode).toBe(400);
    });

    it('retient le premier Hall of Fame vu, une seule fois', async () => {
      const cookie = await register();
      const first = (
        await app.inject({ method: 'POST', url: '/me/hof-seen', headers: { cookie } })
      ).json();
      const again = (
        await app.inject({ method: 'POST', url: '/me/hof-seen', headers: { cookie } })
      ).json();
      expect(first.firstHofSeenAt).toBeTruthy();
      expect(again.firstHofSeenAt).toBe(first.firstHofSeenAt);
      expect((await me(cookie)).hofSeen).toBe(true);
    });

    it('annonce chaque Hall of Fame tiré (card_drop_hof)', async () => {
      await db.execute(sql`delete from pack_types where code = 'only-hof'`);
      await db.execute(sql`insert into games (id, name, slug) values (900, 'Starfall Odyssey', 'starfall')
        on conflict (id) do nothing`);
      const [card] = (
        await db.execute<{ id: number }>(sql`
          insert into cards (series_id, game_id, number, rarity, score_at_print, atk, def, hp, spd, family)
          values (1, 900, 900, 'hof', 999, 99, 99, 99, 12, 'rpg')
          on conflict (series_id, game_id) do update set rarity = 'hof'
          returning id`)
      ).rows;
      const [type] = (
        await db.execute<{ id: number }>(sql`
          insert into pack_types (code, name, cost, odds)
          values ('only-hof', 'Pack test', 100, ${JSON.stringify(DEFAULT_PACK_ODDS)}::jsonb) returning id`)
      ).rows;
      // Un seul Hall of Fame et 4 Starter : le pack contient exactement ce Hall of Fame.
      await db.execute(sql`insert into draw_pool values (${type!.id}, 'hof', 1, ${card!.id})`);
      await db.execute(sql`insert into draw_pool select ${type!.id}, 'starter', idx, card_id from draw_pool
        where pack_type_id = ${packTypeId} and rarity = 'starter'`);
      await db.execute(
        sql`insert into draw_pool_counts values (${type!.id}, 'hof', 1), (${type!.id}, 'starter', 12)`,
      );

      const cookie = await register();
      await db.execute(sql`update users set shards = 100`);
      rng = (max) => (max === 10_000 ? 9_999 : counter++ % max);
      const opened = await app.inject({
        method: 'POST',
        url: '/packs/open',
        headers: { cookie },
        payload: { packTypeId: type!.id, idempotencyKey: randomUUID() },
      });
      expect(opened.statusCode).toBe(200);
      // Rien n'est annoncé tant que la carte n'est pas révélée (règle anti-fuite).
      expect((await app.inject({ url: '/drops/hof' })).json().drops).toEqual([]);
      await app.inject({
        method: 'POST',
        url: `/packs/openings/${opened.json().openingId}/reveal-all`,
        headers: { cookie },
      });

      const drops = (await app.inject({ url: '/drops/hof' })).json().drops;
      expect(drops).toEqual([
        expect.objectContaining({
          username: 'Link_64',
          cardId: card!.id,
          name: 'Starfall Odyssey',
        }),
      ]);
      const later = (
        await app.inject({ url: `/drops/hof?since=${encodeURIComponent(drops[0].createdAt)}` })
      ).json();
      expect(later.drops).toEqual([]);
      expect((await app.inject({ url: '/drops/hof?since=hier' })).statusCode).toBe(400);
    });
  });

  describe('anti-fuite : révélation côté serveur', () => {
    const rawOpen = (cookie: string, key = randomUUID()) =>
      app.inject({
        method: 'POST',
        url: '/packs/open',
        headers: { cookie },
        payload: { packTypeId, idempotencyKey: key },
      });
    const reveal = (cookie: string, id: number, index: number) =>
      app.inject({
        method: 'POST',
        url: `/packs/openings/${id}/reveal`,
        headers: { cookie },
        payload: { index },
      });

    it('l’ouverture ne renvoie ni rareté ni finition, seulement le nombre de cartes', async () => {
      const cookie = await register();
      const res = await rawOpen(cookie);
      const body = res.json();
      expect(body).toMatchObject({ total: 5, revealedCount: 0, revealed: [] });
      expect(body).not.toHaveProperty('cards');
      expect(res.body).not.toMatch(/rarity|finish|starter|bonus|combo|boss|holo|fullart|cardId/i);
    });

    it('révèle dans l’ordre, la plus rare en dernier, sans saut en avant', async () => {
      const cookie = await register();
      const { openingId } = (await rawOpen(cookie)).json();
      expect((await reveal(cookie, openingId, 2)).json()).toEqual({ error: 'reveal_out_of_order' });
      const rarities: string[] = [];
      for (let i = 0; i < 5; i++) {
        const r = (await reveal(cookie, openingId, i)).json();
        expect(r).toMatchObject({ index: i, total: 5 });
        rarities.push(r.card.rarity);
      }
      expect(rarities).toEqual(['starter', 'starter', 'starter', 'bonus', 'combo']);
      // Re-révéler une carte déjà vue est permis (idempotent).
      expect((await reveal(cookie, openingId, 0)).json().card.rarity).toBe('starter');
      expect((await reveal(cookie, openingId, 5)).statusCode).toBe(404);
    });

    it('un rechargement reprend les cartes déjà révélées, pas les suivantes', async () => {
      const cookie = await register();
      const key = randomUUID();
      const { openingId } = (await rawOpen(cookie, key)).json();
      await reveal(cookie, openingId, 0);
      await reveal(cookie, openingId, 1);
      const replay = (await rawOpen(cookie, key)).json();
      expect(replay).toMatchObject({ replayed: true, total: 5, revealedCount: 2 });
      expect(replay.revealed).toHaveLength(2);
    });

    it('n’ouvre pas les cartes d’un autre joueur', async () => {
      const cookie = await register();
      const { openingId } = (await rawOpen(cookie)).json();
      const other = await register({ ...account, username: 'Zelda', email: 'zelda@hyrule.fr' });
      expect((await reveal(other, openingId, 0)).statusCode).toBe(404);
    });
  });

  describe('finitions et éditions', () => {
    const openType = (cookie: string, id: number) => open(cookie, randomUUID(), id);

    async function packType(code: string, finishOdds: object, bindsCards: boolean) {
      await db.execute(sql`delete from pack_types where code = ${code}`);
      const [t] = (
        await db.execute<{ id: number }>(sql`
          insert into pack_types (code, name, cost, odds, finish_odds, binds_cards)
          values (${code}, ${code}, 100, ${JSON.stringify(DEFAULT_PACK_ODDS)}::jsonb,
                  ${JSON.stringify(finishOdds)}::jsonb, ${bindsCards})
          returning id`)
      ).rows;
      await db.execute(sql`insert into draw_pool select ${t!.id}, rarity, idx, card_id from draw_pool
        where pack_type_id = ${packTypeId}`);
      await db.execute(sql`insert into draw_pool_counts select ${t!.id}, rarity, n from draw_pool_counts
        where pack_type_id = ${packTypeId}`);
      return t!.id;
    }

    it('tire les finitions avec les taux du type de pack', async () => {
      const cookie = await register();
      await db.execute(sql`update users set shards = 1000`);
      // Le hasard renvoie 0 : avec ces taux, toutes les cartes sortent en holo.
      const allHolo = await packType('test-holo', { holo: 1, fullart: 0 }, false);
      const res = (await openType(cookie, allHolo)).json();
      expect(res.cards.map((c: { finish: string }) => c.finish)).toEqual(Array(5).fill('holo'));
      const none = await packType('test-normal', { holo: 0, fullart: 0 }, false);
      const res2 = (await openType(cookie, none)).json();
      expect(res2.cards.map((c: { finish: string }) => c.finish)).toEqual(Array(5).fill('normal'));
      const packs = (await app.inject({ url: '/packs' })).json().packs;
      expect(packs.find((p: { code: string }) => p.code === 'standard').finishOdds).toEqual({
        holo: 0.05,
        fullart: 0.01,
      });
    });

    it('un pack qui lie ses cartes les lie toutes, quelle que soit la finition (JONUM)', async () => {
      const cookie = await register();
      await db.execute(sql`update users set shards = 1000`);
      const bound = await packType('test-vip', { holo: 1, fullart: 0 }, true);
      await openType(cookie, bound);
      const rows = await db.execute(
        sql`select bool_and(is_bound) b, count(*)::int n from user_cards`,
      );
      expect(rows.rows[0]).toEqual({ b: true, n: 5 });
      // Rien de recyclable : les cartes liées n'entrent jamais dans les doublons.
      await openType(cookie, bound);
      const dup = (await app.inject({ url: '/collection/duplicates', headers: { cookie } })).json();
      expect(dup).toEqual({ copies: 0, shards: 0 });
    });

    it('une Édition Arène est toujours liée et rattachée à un événement', async () => {
      const cookie = await register();
      const card = (await open(cookie)).json().cards[0];
      await db.execute(sql`delete from events where code = 'worlds-2026'`);
      const [ev] = (
        await db.execute<{ id: number }>(sql`
          insert into events (code, name, starts_at, ends_at)
          values ('worlds-2026', 'Worlds 2026', now(), now() + interval '7 days') returning id`)
      ).rows;
      await expect(
        db.execute(sql`insert into user_cards (user_id, card_id, finish, is_bound, event_id)
          values (1, ${card.cardId}, 'arena', false, ${ev!.id})`),
      ).rejects.toThrow();
      await expect(
        db.execute(sql`insert into user_cards (user_id, card_id, finish, is_bound)
          values (1, ${card.cardId}, 'arena', true)`),
      ).rejects.toThrow();
      await db.execute(sql`insert into user_cards (user_id, card_id, finish, is_bound, event_id, quantity)
        values (1, ${card.cardId}, 'arena', true, ${ev!.id}, 3)`);

      // Jamais recyclable, même en plusieurs exemplaires.
      const dup = (await app.inject({ url: '/collection/duplicates', headers: { cookie } })).json();
      expect(dup.copies).toBe(0);
      const recycle = await app.inject({
        method: 'POST',
        url: '/cards/recycle',
        headers: { cookie },
        payload: { cardId: card.cardId, finish: 'arena', quantity: 1 },
      });
      expect(recycle.statusCode).toBe(409);

      // Filtre « Finition » du classeur, avec le nom de l'événement.
      const arena = (
        await app.inject({ url: '/collection?finish=arena', headers: { cookie } })
      ).json();
      expect(arena.total).toBe(1);
      expect(arena.cards[0]).toMatchObject({
        finish: 'arena',
        isBound: true,
        eventName: 'Worlds 2026',
      });
      const detail = (
        await app.inject({ url: `/cards/${card.cardId}`, headers: { cookie } })
      ).json();
      expect(detail.owned.map((o: { finish: string }) => o.finish)).toContain('arena');
    });
  });

  describe('collection', () => {
    it('liste, filtre et pagine les cartes du joueur seulement', async () => {
      const cookie = await register();
      await open(cookie);
      await open(cookie);
      const other = await register({ ...account, username: 'Zelda', email: 'zelda@hyrule.fr' });
      await open(other);

      const all = (await app.inject({ url: '/collection?pageSize=4', headers: { cookie } })).json();
      expect(all.total).toBe(10);
      expect(all.cards).toHaveLength(4);
      expect(all.cards[0]).toHaveProperty('rarityLabel');

      const combos = (
        await app.inject({ url: '/collection?rarity=combo', headers: { cookie } })
      ).json();
      expect(combos.total).toBe(2);
      expect(combos.cards.every((c: { rarity: string }) => c.rarity === 'combo')).toBe(true);

      const byRarity = (
        await app.inject({ url: '/collection?sort=rarity', headers: { cookie } })
      ).json();
      expect(byRarity.cards[0].rarity).toBe('combo');

      const bad = await app.inject({ url: '/collection?rarity=legendaire', headers: { cookie } });
      expect(bad.statusCode).toBe(400);
    });
  });
});
