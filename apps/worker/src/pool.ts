import { and, eq, sql } from 'drizzle-orm';
import { drawPool, drawPoolCounts, packTypes, type Db } from '@pixpedia/db';
import { DEFAULT_PACK_ODDS, RARITY_KEYS, type Rarity } from '@pixpedia/shared';

type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

export interface PoolSummary {
  packType: string;
  counts: Record<Rarity, number>;
}

/** Crée le pack standard s'il n'existe pas, avec les taux de drop de départ. */
export async function ensureStandardPack(db: Db | Tx): Promise<void> {
  await db
    .insert(packTypes)
    .values({ code: 'standard', name: 'Pack standard', odds: DEFAULT_PACK_ODDS })
    .onConflictDoNothing({ target: packTypes.code });
}

/**
 * Reconstruit `draw_pool` et `draw_pool_counts` à partir des cartes de la série `seriesId`
 * dont le jeu est tirable. À appeler dans la transaction qui modifie les cartes :
 * les lecteurs voient l'ancien pool jusqu'au COMMIT, jamais un pool vide (spec §8.4).
 */
export async function rebuildDrawPool(tx: Tx, seriesId: number): Promise<PoolSummary[]> {
  await ensureStandardPack(tx);
  const types = await tx.select().from(packTypes).where(eq(packTypes.isActive, true));
  const summaries: PoolSummary[] = [];

  for (const type of types) {
    if (Object.keys(type.filter as object).length > 0) {
      throw new Error(`Pack ${type.code} : les packs filtrés arrivent en phase 5.`);
    }
    await tx.delete(drawPool).where(eq(drawPool.packTypeId, type.id));
    await tx.delete(drawPoolCounts).where(eq(drawPoolCounts.packTypeId, type.id));
    await tx.execute(sql`
      insert into draw_pool (pack_type_id, rarity, idx, card_id)
      select ${type.id}, c.rarity, row_number() over (partition by c.rarity order by c.id), c.id
      from cards c
      join games g on g.id = c.game_id
      where c.series_id = ${seriesId} and g.status = 'eligible' and g.is_drawable
    `);
    await tx.execute(sql`
      insert into draw_pool_counts (pack_type_id, rarity, n)
      select pack_type_id, rarity, count(*) from draw_pool
      where pack_type_id = ${type.id}
      group by pack_type_id, rarity
    `);
    const rows = await tx
      .select({ rarity: drawPoolCounts.rarity, n: drawPoolCounts.n })
      .from(drawPoolCounts)
      .where(and(eq(drawPoolCounts.packTypeId, type.id)));
    const counts = Object.fromEntries(RARITY_KEYS.map((k) => [k, 0])) as Record<Rarity, number>;
    for (const r of rows) counts[r.rarity as Rarity] = r.n;
    summaries.push({ packType: type.code, counts });
  }
  return summaries;
}
