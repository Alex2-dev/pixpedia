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
    expect(pop.votes).toHaveLength(2);
    expect(pop.timeToBeat).toHaveLength(3);
  });

  it('calcule ATK, DEF, PV et VIT en percentile', () => {
    expect(computeStats(games[2]!, pop)).toEqual({ atk: 99, def: 99, hp: 99, spd: 10 });
    expect(computeStats(games[0]!, pop)).toEqual({ atk: 10, def: 10, hp: 10, spd: 99 });
  });

  it('applique les valeurs par défaut quand la donnée manque', () => {
    expect(computeStats(games[3]!, pop)).toEqual({ atk: 40, def: 10, hp: 50, spd: 50 });
  });

  it('calcule DEF parmi les jeux votés seulement : les jeux sans vote ne tassent pas l’échelle', () => {
    const many: StatsInput[] = [
      ...Array.from({ length: 100 }, () => ({ rating: null, votes: 0, timeToBeatSec: null })),
      { rating: 50, votes: 5, timeToBeatSec: null },
      { rating: 60, votes: 50, timeToBeatSec: null },
      { rating: 70, votes: 500, timeToBeatSec: null },
    ];
    const p = buildStatsPopulation(many);
    expect(computeStats(many[100]!, p).def).toBe(10);
    expect(computeStats(many[101]!, p).def).toBe(55);
    expect(computeStats(many[102]!, p).def).toBe(99);
    expect(computeStats(many[0]!, p).def).toBe(10);
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
