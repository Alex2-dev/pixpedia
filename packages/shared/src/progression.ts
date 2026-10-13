import { RARITY_KEYS, rarityRank, type Rarity } from './constants';
import { canRecycle, type Finish } from './finishes';

export const SET_TYPE_KEYS = [
  'platform',
  'decade',
  'year',
  'genre',
  'theme',
  'developer',
  'publisher',
  'franchise',
] as const;
export type SetType = (typeof SET_TYPE_KEYS)[number];

export interface SetTypeInfo {
  type: SetType;
  label: string;
  /** Taille minimum pour qu'un set existe (évite des milliers de sets d'un seul jeu). */
  minSize: number;
}

/** Dimensions de progression de la collection. */
export const SET_TYPES: SetTypeInfo[] = [
  { type: 'platform', label: 'Plateformes', minSize: 1 },
  { type: 'decade', label: 'Décennies', minSize: 1 },
  { type: 'year', label: 'Années', minSize: 1 },
  { type: 'genre', label: 'Genres', minSize: 1 },
  { type: 'theme', label: 'Thèmes', minSize: 1 },
  { type: 'developer', label: 'Développeurs', minSize: 5 },
  { type: 'publisher', label: 'Éditeurs', minSize: 5 },
  { type: 'franchise', label: 'Franchises', minSize: 3 },
];

/** Éclats gagnés par doublon recyclé (spec §5.6). */
export const SHARDS_PER_DUPLICATE: Record<Rarity, number> = {
  starter: 1,
  bonus: 3,
  combo: 10,
  boss: 40,
  final: 150,
  hof: 500,
};

/** Coût d'un pack standard en plus du stock gratuit (spec §5.6). */
export const EXTRA_STANDARD_PACK_SHARDS = 50;
/** Coût de départ d'un pack thématique (spec §5.6). */
export const THEMATIC_PACK_SHARDS = 100;

export function recycleValue(rarity: Rarity, copies: number): number {
  return SHARDS_PER_DUPLICATE[rarity] * copies;
}

/**
 * Exemplaires recyclables d'une ligne de collection : on garde toujours un exemplaire,
 * et une carte liée ne se recycle jamais, sinon elle redeviendrait un pack de cartes libres (spec §17.4).
 */
export function recyclableCopies(row: {
  quantity: number;
  isBound: boolean;
  finish?: Finish;
}): number {
  return canRecycle({ finish: row.finish ?? 'normal', isBound: row.isBound })
    ? Math.max(0, row.quantity - 1)
    : 0;
}

/**
 * Raretés à essayer quand le pool d'une rareté est vide : d'abord en dessous (spec §8.3 c),
 * puis au-dessus, pour les packs thématiques dont le pool n'a pas toutes les raretés.
 */
export function rarityFallbackOrder(rarity: Rarity): Rarity[] {
  const rank = rarityRank(rarity);
  const lower = RARITY_KEYS.slice(0, rank).reverse();
  const higher = RARITY_KEYS.slice(rank + 1);
  return [rarity, ...lower, ...higher];
}
