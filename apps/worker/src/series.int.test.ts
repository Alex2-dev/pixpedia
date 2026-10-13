import { fileURLToPath } from 'node:url';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDb, games, userCards, users, type Db } from '@pixpedia/db';
import { printSeries } from './series';

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)('printSeries (intégration, TEST_DATABASE_URL)', () => {
  let db: Db;
  let end: () => Promise<void>;
  const log = () => {};
  const cardsOf = async () =>
    (
      await db.execute<{ id: number; game_id: number; number: number }>(
        sql`select id, game_id, number from cards order by game_id`,
      )
    ).rows;

  beforeAll(async () => {
    const created = createDb(url);
    db = created.db;
    end = () => created.pool.end();
    await migrate(db, {
      migrationsFolder: fileURLToPath(new URL('../../../packages/db/drizzle', import.meta.url)),
    });
    await db.execute(
      sql`truncate users, set_cards, sets, draw_pool, draw_pool_counts, pack_types, cards, series,
          game_companies, companies, game_franchises, franchises, game_genres, genres, games
          restart identity cascade`,
    );
    await db.insert(games).values(
      [30, 10, 20].map((id) => ({
        id,
        name: `Jeu ${id}`,
        slug: `jeu-${id}`,
        releaseDecade: 2000,
        totalRating: 50 + id,
        totalRatingCount: id * 10,
      })),
    );
  });

  afterAll(async () => {
    await end?.();
  });

  it('numérote les cartes par id de jeu et remplit le pool', async () => {
    const summary = await printSeries(db, 'S0', log);
    expect(summary.cards).toBe(3);
    expect((await cardsOf()).map((c) => [c.game_id, c.number])).toEqual([
      [10, 1],
      [20, 2],
      [30, 3],
    ]);
    expect(summary.pools.find((p) => p.packType === 'standard')!.counts).toMatchObject({
      bonus: 3,
    });
  });

  it('construit les sets par décennie, année, genre, développeur, éditeur et franchise', async () => {
    await db.insert(games).values(
      [40, 50].map((id) => ({
        id,
        name: `Jeu ${id}`,
        slug: `jeu-${id}`,
        releaseDecade: 2010,
        firstReleaseDate: new Date('2011-03-01'),
        totalRating: 80,
        totalRatingCount: 100,
      })),
    );
    await db.execute(sql`
      insert into genres (id, name, slug) values (12, 'Role-playing (RPG)', 'role-playing-rpg');
      insert into game_genres values (10, 12), (20, 12);
      insert into companies (id, name, slug) values (1, 'FromSoftware', 'fromsoftware'), (2, 'Solo', 'solo');
      insert into game_companies values (10, 1, 'developer'), (20, 1, 'developer'), (30, 1, 'developer'),
        (40, 1, 'developer'), (50, 1, 'developer'), (10, 2, 'publisher');
      insert into franchises (id, name, slug) values (5, 'Souls', 'souls');
      insert into game_franchises values (10, 5), (20, 5), (30, 5);
    `);
    const summary = await printSeries(db, 'S0', log);
    const { rows } = await db.execute<{ type: string; key: string; name: string; total: number }>(
      sql`select type, key, name, total from sets order by type, key`,
    );
    expect(rows).toEqual([
      { type: 'decade', key: '2000', name: 'Années 2000', total: 3 },
      { type: 'decade', key: '2010', name: 'Années 2010', total: 2 },
      { type: 'developer', key: 'fromsoftware', name: 'FromSoftware', total: 5 },
      { type: 'franchise', key: 'souls', name: 'Souls', total: 3 },
      { type: 'genre', key: 'role-playing-rpg', name: 'Role-playing (RPG)', total: 2 },
      { type: 'year', key: '2011', name: '2011', total: 2 },
    ]);
    // L'éditeur « Solo » n'a qu'un jeu : sous le minimum de 5, pas de set.
    expect(summary.sets).toMatchObject({ developer: 1, publisher: 0, franchise: 1 });

    // Pack thématique FromSoftware : son pool est le set ; Final Fantasy n'existe pas, il est désactivé.
    const packs = await db.execute<{ code: string; is_active: boolean; n: number }>(sql`
      select p.code, p.is_active, coalesce(sum(c.n), 0)::int as n
      from pack_types p left join draw_pool_counts c on c.pack_type_id = p.id
      where p.code in ('developer-fromsoftware', 'franchise-final-fantasy')
      group by p.code, p.is_active order by p.code
    `);
    expect(packs.rows).toEqual([
      { code: 'developer-fromsoftware', is_active: true, n: 5 },
      { code: 'franchise-final-fantasy', is_active: false, n: 0 },
    ]);
  });

  it('se recalcule alors que des joueurs possèdent des cartes, sans changer leurs id', async () => {
    const before = await cardsOf();
    const [user] = await db
      .insert(users)
      .values({
        username: 'joueur',
        email: 'j@x.fr',
        passwordHash: 'x',
        countryCode: 'FR',
        ageConfirmedAt: new Date(),
      })
      .returning();
    await db.insert(userCards).values({ userId: user!.id, cardId: before[0]!.id });

    await printSeries(db, 'S0', log);
    expect(await cardsOf()).toEqual(before);
  });

  it('garde la carte possédée d’un jeu sorti du catalogue, hors du tirage', async () => {
    const before = await cardsOf();
    await db.execute(sql`update games set status = 'excluded' where id in (10, 20)`);
    const summary = await printSeries(db, 'S0', log);

    // Jeu 10 : possédé, sa carte reste. Jeu 20 : personne ne l'a, sa carte disparaît.
    expect((await cardsOf()).map((c) => c.game_id)).toEqual([10, 30, 40, 50]);
    expect((await cardsOf())[0]!.id).toBe(before[0]!.id);
    const pool = await db.execute<{ game_id: number }>(
      sql`select distinct c.game_id from draw_pool d join cards c on c.id = d.card_id
          join pack_types p on p.id = d.pack_type_id where p.code = 'standard'`,
    );
    expect(pool.rows.map((r) => r.game_id).sort()).toEqual([30, 40, 50]);
    expect(summary.cards).toBe(3);
  });
});
