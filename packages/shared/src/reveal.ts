import type { Rarity } from './constants';
import type { Finish } from './finishes';
import type { SlotOdds } from './packs';

export type DropKind = 'boss' | 'final' | 'hof';

/** Étapes d'une révélation, jouées dans l'ordre : retournement → drop de rareté → effet de finition. */
export type RevealStep =
  | 'flip'
  | 'flip-combo'
  | 'drop-boss'
  | 'drop-final'
  | 'drop-hof'
  | 'finish-holo'
  | 'finish-fullart'
  | 'finish-arena';

/** Durées des étapes (maquette pixpedia-cartes-animations.html). */
export const REVEAL_STEP_MS: Record<RevealStep, number> = {
  flip: 400,
  'flip-combo': 500,
  'drop-boss': 1400,
  'drop-final': 3000,
  'drop-hof': 4500,
  'finish-holo': 1700,
  'finish-fullart': 3000,
  'finish-arena': 2100,
};

const DROP_STEP: Partial<Record<Rarity, RevealStep>> = {
  boss: 'drop-boss',
  final: 'drop-final',
  hof: 'drop-hof',
};
const FINISH_STEP: Record<Finish, RevealStep | null> = {
  normal: null,
  holo: 'finish-holo',
  fullart: 'finish-fullart',
  arena: 'finish-arena',
};

/**
 * Étapes de révélation d'une carte. Ex. Starter normal = ['flip'], Combo = ['flip-combo'],
 * Boss Holo = ['flip', 'drop-boss', 'finish-holo'], Hall of Fame Full art = ['flip', 'drop-hof', 'finish-fullart'].
 */
export function getRevealAnimation(rarity: Rarity, finish: Finish = 'normal'): RevealStep[] {
  const steps: RevealStep[] = [rarity === 'combo' ? 'flip-combo' : 'flip'];
  const drop = DROP_STEP[rarity];
  if (drop) steps.push(drop);
  const fin = FINISH_STEP[finish];
  if (fin) steps.push(fin);
  return steps;
}

/** Une révélation qui passe par l'écran plein (drop ou finition) plutôt que par le simple retournement. */
export const needsOverlay = (steps: readonly RevealStep[]) => steps.length > 1;

/** Drop de rareté de la liste, s'il y en a un. */
export function dropOf(steps: readonly RevealStep[]): DropKind | null {
  const d = steps.find((s) => s.startsWith('drop-'));
  return d ? (d.slice(5) as DropKind) : null;
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
