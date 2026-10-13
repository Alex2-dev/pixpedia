import type { Rarity } from '@pixpedia/shared';
import type { CardData } from '../../card/types';

/** Une carte tirée, telle que l'écran d'ouverture la montre. */
export interface OpeningCard {
  card: CardData;
  rarity: Rarity;
  /** Numéro du pack d'origine (1 à N). */
  pack: number;
  isNew: boolean;
}

export type OpeningPhase = 'idle' | 'tearing' | 'reveal' | 'recap';

/**
 * Pilote de la déchirure. Seul « auto » existe pour l'instant ; la V2 ajoutera
 * « gesture » (glisser le doigt pour déchirer), qui fournira la progression 0 → 1.
 */
export type TearDriver = { kind: 'auto' } | { kind: 'gesture'; progress: number };

/** Durée de la déchirure : 1,75 s pour 1 pack, 0,98 s + 0,38 s par pack suivant (3,26 s pour 7). */
export function tearDurationMs(packCount: number): number {
  return packCount <= 1 ? 1750 : Math.round(980 + (packCount - 1) * 380);
}

/** Ordre de révélation : pack par pack, et dans chaque pack la carte la plus rare en dernier. */
export function revealOrder(
  cards: readonly OpeningCard[],
  rank: (r: Rarity) => number,
): OpeningCard[] {
  return cards
    .map((c, i) => ({ c, i }))
    .sort((a, b) => a.c.pack - b.c.pack || rank(a.c.rarity) - rank(b.c.rarity) || a.i - b.i)
    .map(({ c }) => c);
}
