import { describe, expect, it } from 'vitest';
import { buildStatsPopulation, computeStats, type StatsInput } from './stats';

const games: StatsInput[] = [
  { rating: 60, votes: 0, timeToBeatSec: 3600 },
  { rating: 70, votes: 10, timeToBeatSec: 36000 },
  { rating: 80, votes: 100, timeToBeatSec: 360000 },
  { rating: null, votes: 0, timeToBeatSec: null },
];
const pop = buildStatsPopulation(games);

describe('computeStats', () => {
  it('ignore les données manquantes dans les populations', () => {
    expect(pop.ratings).toHaveLength(3);
    expect(pop.votes).toHaveLength(4);
    expect(pop.timeToBeat).toHaveLength(3);
  });

  it('calcule ATK, DEF, PV et VIT en percentile', () => {
    expect(computeStats(games[2]!, pop)).toEqual({ atk: 99, def: 99, hp: 99, spd: 10 });
    expect(computeStats(games[0]!, pop)).toEqual({ atk: 10, def: 10, hp: 10, spd: 99 });
  });

  it('applique les valeurs par défaut quand la donnée manque', () => {
    expect(computeStats(games[3]!, pop)).toEqual({ atk: 40, def: 10, hp: 50, spd: 50 });
  });

  it('reste toujours entre 10 et 99', () => {
    for (const g of games) {
      for (const v of Object.values(computeStats(g, pop))) {
        expect(v).toBeGreaterThanOrEqual(10);
        expect(v).toBeLessThanOrEqual(99);
      }
    }
  });
});
