/** Stock maximum de packs gratuits et durée de recharge (spec §5.4). Surchargés par PACK_MAX / PACK_REGEN_MINUTES. */
export const PACK_MAX = 10;
export const PACK_REGEN_MINUTES = 5;

export interface PackStock {
  available: number;
  updatedAt: Date;
}

export interface PackStockResult extends PackStock {
  /** Heure du prochain pack, `null` si le stock est plein. */
  nextPackAt: Date | null;
}

/**
 * Recharge calculée à la lecture, sans cron (spec §8.2). Le temps écoulé qui n'a pas
 * encore donné de pack est conservé ; une fois le stock plein, le compteur repart de `now`.
 */
export function computePackStock(
  stock: PackStock,
  now: Date,
  opts: { max: number; regenMs: number } = {
    max: PACK_MAX,
    regenMs: PACK_REGEN_MINUTES * 60_000,
  },
): PackStockResult {
  if (stock.available >= opts.max) {
    return { available: stock.available, updatedAt: now, nextPackAt: null };
  }
  const elapsed = Math.max(0, now.getTime() - stock.updatedAt.getTime());
  const gained = Math.floor(elapsed / opts.regenMs);
  const available = Math.min(opts.max, stock.available + gained);
  if (available >= opts.max) return { available, updatedAt: now, nextPackAt: null };
  const updatedAt = new Date(stock.updatedAt.getTime() + gained * opts.regenMs);
  return { available, updatedAt, nextPackAt: new Date(updatedAt.getTime() + opts.regenMs) };
}

export const FINISHES = ['normal', 'holo', 'full_art'] as const;
export type Finish = (typeof FINISHES)[number];

/** Finition tirée à chaque carte, indépendante de la rareté : holo 1/20, full art 1/200 (spec §5.2). */
export function rollFinish(randomInt: (max: number) => number): Finish {
  const r = randomInt(200);
  if (r === 0) return 'full_art';
  if (r <= 10) return 'holo';
  return 'normal';
}
