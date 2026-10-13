import { eq, sql } from 'drizzle-orm';
import { drawPool, drawPoolCounts, packTypes, type Db } from '@pixpedia/db';
import {
  DEFAULT_PACK_ODDS,
  PACK_SIZE,
  RARITY_KEYS,
  THEMATIC_PACK_SHARDS,
  type Rarity,
  type SetType,
} from '@pixpedia/shared';

type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

export interface PoolSummary {
  packType: string;
  counts: Record<Rarity, number>;
}

/** Filtre d'un pack thématique : le pool est un set de la série. */
export interface PackFilter {
  set?: { type: SetType; key: string };
}

/** Packs thématiques de départ (spec §5.5), achetables en éclats. */
export const THEMATIC_PACKS: { code: string; name: string; filter: Required<PackFilter> }[] = [
  { code: 'decade-1980', name: 'Pack années 80', filter: { set: { type: 'decade', key: '1980' } } },
  { code: 'decade-1990', name: 'Pack années 90', filter: { set: { type: 'decade', key: '1990' } } },
  {
    code: 'decade-2000',
    name: 'Pack années 2000',
    filter: { set: { type: 'decade', key: '2000' } },
  },
  {
    code: 'genre-rpg',
    name: 'Pack RPG',
    filter: { set: { type: 'genre', key: 'role-playing-rpg' } },
  },
  {
    code: 'genre-platform',
    name: 'Pack Plateforme',
    filter: { set: { type: 'genre', key: 'platform' } },
  },
  { code: 'theme-horror', name: 'Pack Horreur', filter: { set: { type: 'theme', key: 'horror' } } },
  {
    code: 'platform-n64',
    name: 'Pack Nintendo 64',
    filter: { set: { type: 'platform', key: 'n64' } },
  },
  {
    code: 'platform-ps2',
    name: 'Pack PlayStation 2',
    filter: { set: { type: 'platform', key: 'ps2' } },
  },
  {
    code: 'franchise-final-fantasy',
    name: 'Pack Final Fantasy',
    filter: { set: { type: 'franchise', key: 'final-fantasy' } },
  },
  {
    code: 'developer-fromsoftware',
    name: 'Pack FromSoftware',
    filter: { set: { type: 'developer', key: 'fromsoftware' } },
  },
];

/** Crée le pack standard et les packs thématiques de départ s'ils n'existent pas. */
export async function ensurePackTypes(db: Db | Tx): Promise<void> {
  await db
    .insert(packTypes)
    .values([
      { code: 'standard', name: 'Pack standard', odds: DEFAULT_PACK_ODDS },
      ...THEMATIC_PACKS.map((p) => ({
        code: p.code,
        name: p.name,
        filter: p.filter,
        cost: THEMATIC_PACK_SHARDS,
        odds: DEFAULT_PACK_ODDS,
      })),
    ])
    .onConflictDoNothing({ target: packTypes.code });
}

/**
 * Reconstruit `draw_pool` et `draw_pool_counts` à partir des cartes de la série `seriesId`
 * dont le jeu est tirable. À appeler dans la transaction qui modifie les cartes et les sets :
 * les lecteurs voient l'ancien pool jusqu'au COMMIT, jamais un pool vide (spec §8.4).
 * Un pack thématique dont le set n'existe pas ou compte moins de 5 cartes est désactivé.
 */
export async function rebuildDrawPool(tx: Tx, seriesId: number): Promise<PoolSummary[]> {
  await ensurePackTypes(tx);
  const types = await tx.select().from(packTypes);
  const summaries: PoolSummary[] = [];

  for (const type of types) {
    const filter = type.filter as PackFilter;
    await tx.delete(drawPool).where(eq(drawPool.packTypeId, type.id));
    await tx.delete(drawPoolCounts).where(eq(drawPoolCounts.packTypeId, type.id));

    const setJoin = filter.set
      ? sql`join set_cards sc on sc.card_id = c.id
            join sets s on s.id = sc.set_id and s.series_id = ${seriesId}
                       and s.type = ${filter.set.type} and s.key = ${filter.set.key}`
      : sql``;
    await tx.execute(sql`
      insert into draw_pool (pack_type_id, rarity, idx, card_id)
      select ${type.id}, c.rarity, row_number() over (partition by c.rarity order by c.id), c.id
      from cards c
      join games g on g.id = c.game_id
      ${setJoin}
      where c.series_id = ${seriesId} and g.status = 'eligible' and g.is_drawable
    `);
    const { rows } = await tx.execute<{ rarity: Rarity; n: number }>(sql`
      insert into draw_pool_counts (pack_type_id, rarity, n)
      select pack_type_id, rarity, count(*) from draw_pool
      where pack_type_id = ${type.id}
      group by pack_type_id, rarity
      returning rarity, n
    `);

    const counts = Object.fromEntries(RARITY_KEYS.map((k) => [k, 0])) as Record<Rarity, number>;
    for (const r of rows) counts[r.rarity] = r.n;
    const total = rows.reduce((a, r) => a + r.n, 0);
    // Les packs thématiques suivent leur set (5 cartes différentes au moins pour remplir
    // un pack) ; le pack standard reste toujours actif.
    if (filter.set) {
      await tx
        .update(packTypes)
        .set({ isActive: total >= PACK_SIZE })
        .where(eq(packTypes.id, type.id));
    }
    if (type.isActive || total > 0) summaries.push({ packType: type.code, counts });
  }
  return summaries;
}
