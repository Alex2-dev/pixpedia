import { describe, expect, it } from 'vitest';
import { RARITY_KEYS, type Rarity } from './constants';
import {
  DEFAULT_PACK_ODDS,
  applyPity,
  lowerRarity,
  packOddsSchema,
  resetsPity,
  rollRarity,
} from './packs';

describe('DEFAULT_PACK_ODDS', () => {
  it('est une configuration valide (5 emplacements à 100 %)', () => {
    expect(packOddsSchema.safeParse(DEFAULT_PACK_ODDS).success).toBe(true);
  });

  it('refuse un emplacement qui ne fait pas 100 %', () => {
    const bad = [...DEFAULT_PACK_ODDS.slice(0, 4), { combo: 70, boss: 20 }];
    expect(packOddsSchema.safeParse(bad).success).toBe(false);
  });

  it('refuse un nombre d’emplacements différent de 5', () => {
    expect(packOddsSchema.safeParse(DEFAULT_PACK_ODDS.slice(0, 4)).success).toBe(false);
  });
});

describe('rollRarity', () => {
  const slot5 = DEFAULT_PACK_ODDS[4]!;

  it('respecte exactement les bornes des probabilités', () => {
    // Emplacement 5 : Combo 70 %, Boss 22 %, Boss final 7 %, Hall of Fame 1 %.
    expect(rollRarity(slot5, () => 0)).toBe('combo');
    expect(rollRarity(slot5, () => 6999)).toBe('combo');
    expect(rollRarity(slot5, () => 7000)).toBe('boss');
    expect(rollRarity(slot5, () => 9199)).toBe('boss');
    expect(rollRarity(slot5, () => 9200)).toBe('final');
    expect(rollRarity(slot5, () => 9899)).toBe('final');
    expect(rollRarity(slot5, () => 9900)).toBe('hof');
    expect(rollRarity(slot5, () => 9999)).toBe('hof');
  });

  it('reproduit la distribution sur toutes les valeurs possibles', () => {
    const counts: Partial<Record<Rarity, number>> = {};
    for (let i = 0; i < 10_000; i++) {
      const r = rollRarity(DEFAULT_PACK_ODDS[0]!, () => i);
      counts[r] = (counts[r] ?? 0) + 1;
    }
    expect(counts).toEqual({ starter: 7500, bonus: 2200, combo: 300 });
  });

  it('accepte des probabilités décimales', () => {
    expect(rollRarity({ starter: 99.5, hof: 0.5 }, () => 9949)).toBe('starter');
    expect(rollRarity({ starter: 99.5, hof: 0.5 }, () => 9950)).toBe('hof');
  });

  it('demande un entier dans [0, 10000)', () => {
    const maxes: number[] = [];
    rollRarity(slot5, (max) => {
      maxes.push(max);
      return 0;
    });
    expect(maxes).toEqual([10_000]);
  });
});

describe('garantie (pity)', () => {
  it('ne change rien avant 10 packs sans Boss', () => {
    expect(applyPity('combo', 9)).toBe('combo');
  });

  it('relève le dernier emplacement à Boss au 11e pack', () => {
    expect(applyPity('combo', 10)).toBe('boss');
  });

  it('ne baisse jamais une rareté supérieure', () => {
    expect(applyPity('hof', 10)).toBe('hof');
    expect(applyPity('final', 12)).toBe('final');
  });

  it('se remet à zéro dès qu’un pack contient un Boss ou mieux', () => {
    expect(resetsPity(['starter', 'bonus', 'combo', 'bonus', 'combo'])).toBe(false);
    expect(resetsPity(['starter', 'bonus', 'combo', 'bonus', 'boss'])).toBe(true);
    expect(resetsPity(['hof'])).toBe(true);
  });
});

describe('lowerRarity', () => {
  it('descend d’un cran, jusqu’à Starter', () => {
    expect(lowerRarity('hof')).toBe('final');
    expect(lowerRarity('bonus')).toBe('starter');
    expect(lowerRarity('starter')).toBeNull();
  });

  it('parcourt toute l’échelle', () => {
    let r: Rarity | null = 'hof';
    const seen: Rarity[] = [];
    while (r) {
      seen.push(r);
      r = lowerRarity(r);
    }
    expect(seen).toEqual([...RARITY_KEYS].reverse());
  });
});
