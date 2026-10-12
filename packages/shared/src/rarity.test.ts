import { describe, expect, it } from 'vitest';
import type { Rarity } from './constants';
import { DEFAULT_RARITY_PARAMS, assignRarities, tierSize, type RarityInput } from './rarity';

/** Décennie de `n` jeux notés, du meilleur score (id 1) au moins bon. */
function decade(decadeYear: number, n: number, idOffset = 0): RarityInput[] {
  return Array.from({ length: n }, (_, i) => ({
    id: idOffset + i + 1,
    decade: decadeYear,
    rating: 90 - (i * 40) / n,
    votes: 20000 - i,
  }));
}

function countBy(map: Map<number, { rarity: Rarity }>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const { rarity } of map.values()) out[rarity] = (out[rarity] ?? 0) + 1;
  return out;
}

describe('tierSize', () => {
  const [hof, final] = DEFAULT_RARITY_PARAMS.tiers;

  it('applique le pourcentage sur une grande décennie', () => {
    expect(tierSize(hof!, 10000)).toBe(50);
    expect(tierSize(final!, 10000)).toBe(200);
  });

  it('garantit le minimum par décennie', () => {
    expect(tierSize(hof!, 1000)).toBe(10);
    expect(tierSize(final!, 1000)).toBe(60);
  });

  it('plafonne le minimum sur une petite décennie', () => {
    expect(tierSize(hof!, 100)).toBe(5);
    expect(tierSize(final!, 100)).toBe(15);
  });
});

describe('assignRarities', () => {
  it('met les jeux sans note en Starter', () => {
    const r = assignRarities([
      { id: 1, decade: 2000, rating: null, votes: 0 },
      { id: 2, decade: 2000, rating: 80, votes: 0 },
    ]);
    expect(r.get(1)).toEqual({ rarity: 'starter', score: 0 });
    expect(r.get(2)?.rarity).toBe('starter');
  });

  it('répartit les paliers par décennie, dans l’ordre du score', () => {
    const r = assignRarities(decade(2000, 10000));
    expect(countBy(r)).toEqual({ hof: 50, final: 200, boss: 400, combo: 1000, bonus: 8350 });
    expect(r.get(1)?.rarity).toBe('hof');
    expect(r.get(50)?.rarity).toBe('hof');
    expect(r.get(51)?.rarity).toBe('final');
    expect(r.get(10000)?.rarity).toBe('bonus');
  });

  it('classe chaque décennie séparément', () => {
    const r = assignRarities([...decade(1990, 1000), ...decade(2010, 1000, 1000)]);
    expect(r.get(1)?.rarity).toBe('hof');
    expect(r.get(1001)?.rarity).toBe('hof');
    expect(countBy(r).hof).toBe(20);
  });

  it('départage les scores égaux par le nombre de votes', () => {
    const games: RarityInput[] = [
      { id: 1, decade: 2000, rating: 80, votes: 100 },
      { id: 2, decade: 2000, rating: 80, votes: 100 },
    ];
    const params = {
      ...DEFAULT_RARITY_PARAMS,
      tiers: [{ rarity: 'hof' as const, share: 0.5, minPerDecade: 0, minCapShare: 0 }],
    };
    const r = assignRarities(games, params);
    expect(r.get(1)?.rarity).toBe('hof');
    expect(r.get(2)?.rarity).toBe('bonus');
  });

  it('les overrides relèvent la rareté sans prendre la place de personne', () => {
    const games = decade(2000, 1000);
    const base = assignRarities(games);
    const r = assignRarities(games, DEFAULT_RARITY_PARAMS, new Map([[999, 'hof']]));
    expect(r.get(999)?.rarity).toBe('hof');
    expect(countBy(r).hof).toBe(countBy(base).hof! + 1);
    expect(r.get(10)?.rarity).toBe('hof');
  });

  it('un override ne baisse jamais une rareté', () => {
    const r = assignRarities(decade(2000, 1000), DEFAULT_RARITY_PARAMS, new Map([[1, 'bonus']]));
    expect(r.get(1)?.rarity).toBe('hof');
  });

  it('enregistre le score de prestige', () => {
    const r = assignRarities(decade(2000, 100));
    expect(r.get(1)!.score).toBeGreaterThan(r.get(100)!.score);
  });
});
