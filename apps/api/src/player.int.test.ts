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
      sql`truncate users, draw_pool, draw_pool_counts, pack_types, cards, series, games restart identity cascade`,
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

  const open = (cookie: string, key = randomUUID()) =>
    app.inject({
      method: 'POST',
      url: '/packs/open',
      headers: { cookie },
      payload: { packTypeId, idempotencyKey: key },
    });

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
