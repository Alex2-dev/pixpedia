import { STAT_DEFAULTS, STAT_MIN } from './constants';
import { inversePercentileStat, percentileStat, sortPopulation } from './percentile';

export interface StatsInput {
  /** `total_rating` IGDB sur 100, `null` si le jeu n'est pas noté. */
  rating: number | null;
  /** `total_rating_count` IGDB, 0 si aucun vote. */
  votes: number;
  /** Durée de jeu « normale » en secondes, `null` si inconnue. */
  timeToBeatSec: number | null;
}

export interface CardStats {
  atk: number;
  def: number;
  hp: number;
  spd: number;
}

/** Populations triées servant de référence aux percentiles d'une série. */
export interface StatsPopulation {
  ratings: Float64Array;
  votes: Float64Array;
  timeToBeat: Float64Array;
}

export function buildStatsPopulation(games: Iterable<StatsInput>): StatsPopulation {
  const ratings: number[] = [];
  const votes: number[] = [];
  const ttb: number[] = [];
  for (const g of games) {
    if (g.rating !== null) ratings.push(g.rating);
    // Les jeux sans vote (la grande majorité) sont exclus : ils écraseraient l'échelle de DEF.
    if (g.votes > 0) votes.push(g.votes);
    if (g.timeToBeatSec !== null && g.timeToBeatSec > 0) ttb.push(g.timeToBeatSec);
  }
  return {
    ratings: sortPopulation(ratings),
    votes: sortPopulation(votes),
    timeToBeat: sortPopulation(ttb),
  };
}

/**
 * Stats de combat en percentile 10–99 (règles Pixpedia, remplacent la spec §5.3) :
 * ATK = note, DEF = nombre de votes, PV = temps de jeu, VIT = inverse du temps de jeu.
 * Chaque percentile se calcule parmi les jeux qui ont la donnée ; 0 vote donne DEF 10.
 */
export function computeStats(game: StatsInput, pop: StatsPopulation): CardStats {
  const hasTtb = game.timeToBeatSec !== null && game.timeToBeatSec > 0;
  return {
    atk:
      game.rating === null
        ? STAT_DEFAULTS.atkWithoutRating
        : percentileStat(game.rating, pop.ratings),
    def: game.votes > 0 ? percentileStat(game.votes, pop.votes) : STAT_MIN,
    hp: hasTtb
      ? percentileStat(game.timeToBeatSec as number, pop.timeToBeat)
      : STAT_DEFAULTS.hpWithoutTimeToBeat,
    spd: hasTtb
      ? inversePercentileStat(game.timeToBeatSec as number, pop.timeToBeat)
      : STAT_DEFAULTS.spdWithoutTimeToBeat,
  };
}
