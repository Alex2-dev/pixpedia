import { eq, sql } from 'drizzle-orm';
import { cards, rarityOverrides, series, type Db } from '@pixpedia/db';
import {
  DEFAULT_RARITY_PARAMS,
  RARITY_KEYS,
  assignRarities,
  buildStatsPopulation,
  catalogueMean,
  computeStats,
  familyFromGenres,
  type Rarity,
} from '@pixpedia/shared';
import { rebuildDrawPool, type PoolSummary } from './pool';
import type { SeriesSummary } from './report';

interface EligibleRow extends Record<string, unknown> {
  id: number;
  release_decade: number;
  total_rating: number | null;
  total_rating_count: number;
  time_to_beat_sec: number | null;
  genre_slugs: string[];
}

const CHUNK = 1000;

/**
 * Calcule une série : rareté figée (prestige par décennie) et stats figées (percentiles)
 * pour chaque jeu éligible. Refuse de toucher une série déjà publiée.
 */
export async function printSeries(
  db: Db,
  code: string,
  log: (m: string) => void,
): Promise<SeriesSummary> {
  const [existing] = await db.select().from(series).where(eq(series.code, code));
  if (existing?.releasedAt) {
    throw new Error(
      `La série ${code} est publiée depuis le ${existing.releasedAt.toISOString()} : elle est figée.`,
    );
  }

  const { rows } = await db.execute<EligibleRow>(sql`
    select g.id, g.release_decade, g.total_rating, g.total_rating_count, g.time_to_beat_sec,
           coalesce(array_agg(ge.slug) filter (where ge.slug is not null), '{}') as genre_slugs
    from games g
    left join game_genres gg on gg.game_id = g.id
    left join genres ge on ge.id = gg.genre_id
    where g.status = 'eligible' and g.release_decade is not null
    group by g.id
  `);
  const overrides = new Map(
    (await db.select().from(rarityOverrides)).map((o) => [o.gameId, o.minRarity as Rarity]),
  );

  const params = DEFAULT_RARITY_PARAMS;
  const rarities = assignRarities(
    rows.map((g) => ({
      id: g.id,
      decade: g.release_decade,
      rating: g.total_rating,
      votes: g.total_rating_count,
    })),
    params,
    overrides,
  );
  const statsInputs = rows.map((g) => ({
    rating: g.total_rating !== null && g.total_rating_count > 0 ? g.total_rating : null,
    votes: g.total_rating_count,
    timeToBeatSec: g.time_to_beat_sec,
  }));
  const population = buildStatsPopulation(statsInputs);

  const newCards = rows
    .map((g, i) => {
      const { rarity, score } = rarities.get(g.id) as { rarity: Rarity; score: number };
      return {
        gameId: g.id,
        rarity,
        scoreAtPrint: score,
        family: familyFromGenres(g.genre_slugs),
        ...computeStats(statsInputs[i]!, population),
      };
    })
    .sort((a, b) => a.gameId - b.gameId)
    .map((c, i) => ({ ...c, number: i + 1 }));

  let pools: PoolSummary[] = [];
  await db.transaction(async (tx) => {
    const [s] = existing
      ? await tx
          .update(series)
          .set({ rarityParams: params })
          .where(eq(series.id, existing.id))
          .returning()
      : await tx
          .insert(series)
          .values({ code, name: `Série ${code} (brouillon)`, rarityParams: params })
          .returning();
    const seriesId = s!.id;

    // Série brouillon : les cartes sont mises à jour sur place (id stables, exemplaires des
    // joueurs conservés). Le pool pointe sur ces cartes : on le vide puis on le reconstruit
    // dans la même transaction.
    await tx.execute(
      sql`delete from draw_pool where card_id in (select id from cards where series_id = ${seriesId})`,
    );
    for (let i = 0; i < newCards.length; i += CHUNK) {
      await tx
        .insert(cards)
        .values(newCards.slice(i, i + CHUNK).map((c) => ({ ...c, seriesId })))
        .onConflictDoUpdate({
          target: [cards.seriesId, cards.gameId],
          set: {
            number: sql`excluded.number`,
            rarity: sql`excluded.rarity`,
            scoreAtPrint: sql`excluded.score_at_print`,
            atk: sql`excluded.atk`,
            def: sql`excluded.def`,
            hp: sql`excluded.hp`,
            spd: sql`excluded.spd`,
            family: sql`excluded.family`,
          },
        });
    }
    // Un jeu sorti du catalogue perd sa carte, sauf si un joueur la possède (spec §3.4) :
    // elle reste alors dans les classeurs, hors du tirage.
    await tx.execute(sql`
      delete from cards c
      where c.series_id = ${seriesId}
        and not (c.game_id = any(${sql.param(newCards.map((n) => n.gameId))}::int[]))
        and not exists (select 1 from user_cards uc where uc.card_id = c.id)
    `);

    // La cote affichée suit le dernier calcul, sans effet sur les raretés figées.
    for (let i = 0; i < newCards.length; i += CHUNK) {
      const chunk = newCards.slice(i, i + CHUNK);
      await tx.execute(sql`
        update games g set prestige_score = u.score
        from unnest(${sql.param(chunk.map((c) => c.gameId))}::int[], ${sql.param(chunk.map((c) => c.scoreAtPrint))}::real[]) as u(id, score)
        where g.id = u.id
      `);
    }

    pools = await rebuildDrawPool(tx, seriesId);
  });

  const distribution = Object.fromEntries(RARITY_KEYS.map((k) => [k, 0])) as Record<Rarity, number>;
  for (const c of newCards) distribution[c.rarity]++;
  const rated = rows.filter((g) => g.total_rating !== null && g.total_rating_count > 0);
  log(`Série ${code} : ${newCards.length} cartes calculées.`);
  return {
    code,
    cards: newCards.length,
    catalogueMean: catalogueMean(rated.map((g) => g.total_rating as number)),
    distribution,
    pools,
  };
}
