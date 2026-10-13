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
      sql`truncate users, draw_pool, draw_pool_counts, pack_types, cards, series, games restart identity cascade`,
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
    expect(summary.pools[0]!.counts).toMatchObject({ starter: 0 });
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
    expect((await cardsOf()).map((c) => c.game_id)).toEqual([10, 30]);
    expect((await cardsOf())[0]!.id).toBe(before[0]!.id);
    const pool = await db.execute<{ game_id: number }>(
      sql`select c.game_id from draw_pool d join cards c on c.id = d.card_id`,
    );
    expect(pool.rows.map((r) => r.game_id)).toEqual([30]);
    expect(summary.cards).toBe(1);
  });
});
