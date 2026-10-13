import { z } from 'zod';
import type { Rarity } from './constants';

/**
 * Finitions d'un exemplaire possédé (apparence seulement : ni la rareté ni les stats ne changent).
 * - holo, fullart : tirées en pack, indépendamment de la rareté ;
 * - arena (« Édition Arène ») : gagnée gratuitement pendant un événement, toujours liée au compte.
 */
export const FINISHES = ['normal', 'holo', 'fullart', 'arena'] as const;
export type Finish = (typeof FINISHES)[number];

/** Finition d'un exemplaire, en lisant l'ancien nom « full_art » ; inconnue → normale. */
export function normalizeFinish(value: string | null | undefined): Finish {
  if (value === 'full_art') return 'fullart';
  return (FINISHES as readonly string[]).includes(value ?? '') ? (value as Finish) : 'normal';
}

/** Taux de finition d'un pack (probabilité par carte), stockés dans `pack_types.finish_odds`. */
export const finishOddsSchema = z
  .object({ holo: z.number().min(0).max(1), fullart: z.number().min(0).max(1) })
  .refine((o) => o.holo + o.fullart <= 1, { message: 'La somme des taux dépasse 100 %' });
export type FinishOdds = z.infer<typeof finishOddsSchema>;

/** Taux de départ : holo 1 sur 20, full art 1 sur 100. */
export const DEFAULT_FINISH_ODDS: FinishOdds = { holo: 0.05, fullart: 0.01 };

const SCALE = 10_000;

/** Finition tirée à chaque carte d'un pack (jamais Arène, qui ne sort pas des packs). */
export function rollFinish(
  randomInt: (max: number) => number,
  odds: FinishOdds = DEFAULT_FINISH_ODDS,
): Finish {
  const r = randomInt(SCALE);
  const fullart = Math.round(odds.fullart * SCALE);
  const holo = Math.round(odds.holo * SCALE);
  if (r < fullart) return 'fullart';
  if (r < fullart + holo) return 'holo';
  return 'normal';
}

interface Copy {
  finish: Finish;
  isBound: boolean;
}

/** Une carte liée, et toute Édition Arène, ne se recycle jamais en éclats (spec §17.4). */
export const canRecycle = (c: Copy) => !c.isBound && c.finish !== 'arena';
/** Échange entre joueurs (V2) : mêmes règles. */
export const canTrade = (c: Copy) => !c.isBound && c.finish !== 'arena';
/** Vente sur le marché (V2) : mêmes règles. */
export const canSell = (c: Copy) => !c.isBound && c.finish !== 'arena';

export type CardBackKind =
  'standard' | 'boss' | 'final' | 'hof' | 'holo' | 'fullart' | 'arena' | 'vip' | 'event';

/**
 * Dos d'une carte. Priorité : Arène > Full art > Holo > VIP / événement > rareté > standard.
 * `special: false` (ouverture de packs) : toujours le dos standard, pour ne rien trahir avant la révélation.
 */
export function getCardBack(
  card: { rarity: Rarity; finish: Finish; variant?: 'normal' | 'vip' | 'event' },
  { special = true }: { special?: boolean } = {},
): CardBackKind {
  if (!special) return 'standard';
  if (card.finish === 'arena') return 'arena';
  if (card.finish === 'fullart') return 'fullart';
  if (card.finish === 'holo') return 'holo';
  if (card.variant === 'vip' || card.variant === 'event') return card.variant;
  if (card.rarity === 'boss' || card.rarity === 'final' || card.rarity === 'hof')
    return card.rarity;
  return 'standard';
}
