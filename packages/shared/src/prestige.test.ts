import { describe, expect, it } from 'vitest';
import { catalogueMean, prestigeScore, releaseDecade, weightedRating } from './prestige';

describe('prestige (exemples de la spec §5.2, C = 70)', () => {
  it.each([
    ['Obscur surnoté', 95, 3, 71.4, 43],
    ['Excellent jeu de niche', 92, 150, 86.5, 188],
    ['Jeu moyen très connu', 60, 3000, 60.2, 209],
    ['Minecraft: Java Edition', 84.8, 2035, 84.4, 279],
    ['Classique reconnu', 90, 2000, 89.5, 296],
  ])('%s', (_name, rating, votes, wr, score) => {
    expect(weightedRating(rating, votes, 70)).toBeCloseTo(wr, 1);
    expect(Math.round(prestigeScore(rating, votes, 70))).toBe(score);
  });

  it('un jeu sans vote a un score nul et une note fiabilisée égale à la moyenne', () => {
    expect(prestigeScore(90, 0, 70)).toBe(0);
    expect(weightedRating(90, 0, 70)).toBe(70);
  });

  it('le seuil de confiance m est réglable', () => {
    expect(weightedRating(100, 10, 50, 10)).toBe(75);
  });
});

describe('catalogueMean', () => {
  it('fait la moyenne et renvoie 0 sans données', () => {
    expect(catalogueMean([60, 80])).toBe(70);
    expect(catalogueMean([])).toBe(0);
  });
});

describe('releaseDecade', () => {
  it('arrondit à la décennie inférieure', () => {
    expect(releaseDecade(new Date('2011-11-18T00:00:00Z'))).toBe(2010);
    expect(releaseDecade(new Date('1999-12-31T23:00:00Z'))).toBe(1990);
    expect(releaseDecade(new Date('2020-01-01T00:00:00Z'))).toBe(2020);
  });
});
