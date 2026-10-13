import type { Rarity } from './constants';
import type { SlotOdds } from './packs';

export type DropKind = 'boss' | 'final' | 'hof';

export type RevealAnimation =
  | { kind: 'flip'; durationMs: number }
  | { kind: 'flip-halo'; durationMs: number }
  | { kind: 'drop'; drop: DropKind; durationMs: number };

/**
 * Animation de révélation selon la rareté (maquette pixpedia-animations.html) :
 * Starter et Bonus se retournent, Combo ajoute un halo bleu, Boss et au-dessus lancent un drop.
 */
export function getRevealAnimation(rarity: Rarity): RevealAnimation {
  switch (rarity) {
    case 'starter':
    case 'bonus':
      return { kind: 'flip', durationMs: 400 };
    case 'combo':
      return { kind: 'flip-halo', durationMs: 500 };
    case 'boss':
      return { kind: 'drop', drop: 'boss', durationMs: 1400 };
    case 'final':
      return { kind: 'drop', drop: 'final', durationMs: 3000 };
    case 'hof':
      return { kind: 'drop', drop: 'hof', durationMs: 4500 };
  }
}

/** Chance qu'une carte tirée soit de cette rareté : moyenne des emplacements du pack (0 à 1). */
export function perCardChance(rarity: Rarity, odds: readonly SlotOdds[]): number {
  if (!odds.length) return 0;
  const sum = odds.reduce((acc, slot) => acc + (slot[rarity] ?? 0), 0);
  return sum / odds.length / 100;
}

/** « 5,4 % » et « 1 chance sur 19 » (affichés sous la carte et dans les drops). */
export function formatChance(p: number): { pct: string; oneIn: number | null } {
  if (p <= 0) return { pct: '0 %', oneIn: null };
  const pct = Math.round(p * 1000) / 10;
  return {
    pct: `${pct.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`,
    oneIn: Math.round(1 / p),
  };
}
