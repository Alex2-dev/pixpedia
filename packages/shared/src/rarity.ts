import { maxRarity, type Rarity } from './constants';
import { DEFAULT_CONFIDENCE, catalogueMean, prestigeScore } from './prestige';

/** Palier en percentile des jeux notés d'une décennie, du plus prestigieux au moins prestigieux. */
export interface RarityTier {
  rarity: Exclude<Rarity, 'starter' | 'bonus'>;
  /** Part des jeux notés de la décennie, ex. 0.005 = 0,5 %. */
  share: number;
  /** Minimum par décennie (spec §5.2). */
  minPerDecade: number;
  /** Le minimum ne peut pas dépasser cette part de la décennie (petites décennies). */
  minCapShare: number;
}

/** Réglages enregistrés dans `series.rarity_params`. */
export interface RarityParams {
  confidence: number;
  tiers: RarityTier[];
}

export const DEFAULT_RARITY_PARAMS: RarityParams = {
  confidence: DEFAULT_CONFIDENCE,
  tiers: [
    { rarity: 'hof', share: 0.005, minPerDecade: 10, minCapShare: 0.05 },
    { rarity: 'final', share: 0.02, minPerDecade: 60, minCapShare: 0.15 },
    { rarity: 'boss', share: 0.04, minPerDecade: 0, minCapShare: 0 },
    { rarity: 'combo', share: 0.1, minPerDecade: 0, minCapShare: 0 },
  ],
};

export interface RarityInput {
  id: number;
  decade: number;
  /** `total_rating`, `null` si non noté. */
  rating: number | null;
  votes: number;
}

export interface RarityResult {
  rarity: Rarity;
  /** Score de prestige au moment du calcul (`cards.score_at_print`). */
  score: number;
}

function isRated(g: RarityInput): g is RarityInput & { rating: number } {
  return g.rating !== null && g.votes > 0;
}

/** Nombre de places d'un palier dans une décennie de `n` jeux notés. */
export function tierSize(tier: RarityTier, n: number): number {
  const effectiveMin = Math.min(tier.minPerDecade, Math.floor(n * tier.minCapShare));
  return Math.max(Math.round(n * tier.share), effectiveMin);
}

/**
 * Attribue une rareté à chaque jeu (spec §5.2, raretés Pixpedia) :
 * - sans note → Starter ;
 * - sinon classement par décennie selon le score de prestige, paliers en percentile ;
 * - `overrides` impose une rareté minimale, en plus des quotas.
 */
export function assignRarities(
  games: readonly RarityInput[],
  params: RarityParams = DEFAULT_RARITY_PARAMS,
  overrides: ReadonlyMap<number, Rarity> = new Map(),
): Map<number, RarityResult> {
  const rated = games.filter(isRated);
  const mean = catalogueMean(rated.map((g) => g.rating));
  const result = new Map<number, RarityResult>();

  const byDecade = new Map<number, { id: number; votes: number; score: number }[]>();
  for (const g of games) {
    if (!isRated(g)) {
      result.set(g.id, { rarity: 'starter', score: 0 });
      continue;
    }
    const score = prestigeScore(g.rating, g.votes, mean, params.confidence);
    let bucket = byDecade.get(g.decade);
    if (!bucket) byDecade.set(g.decade, (bucket = []));
    bucket.push({ id: g.id, votes: g.votes, score });
  }

  for (const bucket of byDecade.values()) {
    bucket.sort((a, b) => b.score - a.score || b.votes - a.votes || a.id - b.id);
    let cursor = 0;
    for (const tier of params.tiers) {
      const end = Math.min(bucket.length, cursor + tierSize(tier, bucket.length));
      for (; cursor < end; cursor++) {
        const g = bucket[cursor]!;
        result.set(g.id, { rarity: tier.rarity, score: g.score });
      }
    }
    for (; cursor < bucket.length; cursor++) {
      const g = bucket[cursor]!;
      result.set(g.id, { rarity: 'bonus', score: g.score });
    }
  }

  for (const [id, minRarity] of overrides) {
    const current = result.get(id);
    if (current) current.rarity = maxRarity(current.rarity, minRarity);
  }
  return result;
}
