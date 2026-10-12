/** Seuil de confiance `m` de départ (spec §5.2). */
export const DEFAULT_CONFIDENCE = 50;

/** Note fiabilisée : un jeu peu noté est ramené vers la moyenne `catalogueMean`. */
export function weightedRating(
  rating: number,
  votes: number,
  catalogueMean: number,
  confidence = DEFAULT_CONFIDENCE,
): number {
  if (votes <= 0) return catalogueMean;
  return (
    (votes / (votes + confidence)) * rating + (confidence / (votes + confidence)) * catalogueMean
  );
}

/** Score de prestige : `WR × log10(1 + v)`. */
export function prestigeScore(
  rating: number,
  votes: number,
  catalogueMean: number,
  confidence = DEFAULT_CONFIDENCE,
): number {
  if (votes <= 0) return 0;
  return weightedRating(rating, votes, catalogueMean, confidence) * Math.log10(1 + votes);
}

/** Moyenne `C` des notes de tous les jeux notés du catalogue. */
export function catalogueMean(ratings: readonly number[]): number {
  if (ratings.length === 0) return 0;
  let sum = 0;
  for (const r of ratings) sum += r;
  return sum / ratings.length;
}

/** Décennie de sortie, ex. 2011 → 2010. */
export function releaseDecade(date: Date): number {
  return Math.floor(date.getUTCFullYear() / 10) * 10;
}
