import { STAT_MAX, STAT_MIN } from './constants';

/** Trie une copie de la population par ordre croissant, prête pour `percentileStat`. */
export function sortPopulation(values: Iterable<number>): Float64Array {
  return Float64Array.from(values).sort();
}

/** Nombre de valeurs strictement inférieures à `value` (recherche dichotomique). */
function countBelow(sorted: ArrayLike<number>, value: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if ((sorted[mid] as number) < value) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Convertit `value` en stat de 10 à 99 selon sa position dans `sorted` (population triée).
 * La plus petite valeur donne 10, la plus grande 99, et les ex æquo ont la même stat.
 */
export function percentileStat(value: number, sorted: ArrayLike<number>): number {
  const n = sorted.length;
  if (n <= 1) return Math.round((STAT_MIN + STAT_MAX) / 2);
  const p = Math.min(1, countBelow(sorted, value) / (n - 1));
  return Math.round(STAT_MIN + p * (STAT_MAX - STAT_MIN));
}

/** Stat inversée : la plus grande valeur donne 10, la plus petite 99. */
export function inversePercentileStat(value: number, sorted: ArrayLike<number>): number {
  return STAT_MIN + STAT_MAX - percentileStat(value, sorted);
}
