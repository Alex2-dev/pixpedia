import { describe, expect, it } from 'vitest';
import { inversePercentileStat, percentileStat, sortPopulation } from './percentile';

describe('percentileStat', () => {
  const pop = sortPopulation([50, 10, 30, 20, 40]);

  it('borne la plus petite valeur à 10 et la plus grande à 99', () => {
    expect(percentileStat(10, pop)).toBe(10);
    expect(percentileStat(50, pop)).toBe(99);
  });

  it('place la médiane au milieu', () => {
    expect(percentileStat(30, pop)).toBe(55);
  });

  it('donne la même stat aux ex æquo', () => {
    const ties = sortPopulation([0, 0, 0, 5, 9]);
    expect(percentileStat(0, ties)).toBe(10);
    expect(percentileStat(5, ties)).toBe(77);
  });

  it('reste dans les bornes pour une valeur hors population', () => {
    expect(percentileStat(-1, pop)).toBe(10);
    expect(percentileStat(1000, pop)).toBe(99);
  });

  it('renvoie une valeur neutre pour une population vide ou unique', () => {
    expect(percentileStat(3, sortPopulation([]))).toBe(55);
    expect(percentileStat(3, sortPopulation([3]))).toBe(55);
  });
});

describe('inversePercentileStat', () => {
  it('inverse le classement', () => {
    const pop = sortPopulation([1, 2, 3]);
    expect(inversePercentileStat(1, pop)).toBe(99);
    expect(inversePercentileStat(3, pop)).toBe(10);
  });
});
