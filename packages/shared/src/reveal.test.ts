import { describe, expect, it } from 'vitest';
import { RARITY_KEYS } from './constants';
import { FINISHES } from './finishes';
import { DEFAULT_PACK_ODDS } from './packs';
import { REVEAL_STEP_MS, formatChance, getRevealAnimation, perCardChance } from './reveal';

describe('getRevealAnimation (rareté × finition)', () => {
  it('exemples de la consigne', () => {
    expect(getRevealAnimation('starter', 'normal')).toEqual(['flip']);
    expect(getRevealAnimation('combo', 'normal')).toEqual(['flip-combo']);
    expect(getRevealAnimation('boss', 'holo')).toEqual(['flip', 'drop-boss', 'finish-holo']);
    expect(getRevealAnimation('hof', 'fullart')).toEqual(['flip', 'drop-hof', 'finish-fullart']);
  });

  it('couvre toutes les combinaisons : retournement → drop (Boss+) → finition', () => {
    const drop = { boss: 'drop-boss', final: 'drop-final', hof: 'drop-hof' } as const;
    for (const rarity of RARITY_KEYS) {
      for (const finish of FINISHES) {
        const steps = getRevealAnimation(rarity, finish);
        expect(steps[0]).toBe(rarity === 'combo' ? 'flip-combo' : 'flip');
        expect(steps.includes(drop[rarity as keyof typeof drop])).toBe(rarity in drop);
        expect(steps.at(-1)).toBe(finish === 'normal' ? steps.at(-1) : `finish-${finish}`);
        expect(steps).toHaveLength(1 + (rarity in drop ? 1 : 0) + (finish === 'normal' ? 0 : 1));
      }
    }
  });

  it('donne une durée à chaque étape', () => {
    expect(REVEAL_STEP_MS).toMatchObject({
      flip: 400,
      'flip-combo': 500,
      'drop-boss': 1400,
      'drop-final': 3000,
      'drop-hof': 4500,
      'finish-holo': 1700,
      'finish-fullart': 3000,
      'finish-arena': 2100,
    });
  });
});

describe('perCardChance', () => {
  it('fait la moyenne des 5 emplacements du pack standard', () => {
    expect(perCardChance('hof', DEFAULT_PACK_ODDS)).toBeCloseTo(0.002);
    expect(perCardChance('final', DEFAULT_PACK_ODDS)).toBeCloseTo(0.016);
    expect(perCardChance('boss', DEFAULT_PACK_ODDS)).toBeCloseTo(0.054);
    expect(perCardChance('starter', DEFAULT_PACK_ODDS)).toBeCloseTo(0.45);
  });

  it('renvoie 0 sans taux', () => {
    expect(perCardChance('hof', [])).toBe(0);
  });
});

describe('formatChance', () => {
  it('formate en pourcentage français et « 1 chance sur N »', () => {
    expect(formatChance(0.002)).toEqual({ pct: '0,2 %', oneIn: 500 });
    expect(formatChance(0.016)).toEqual({ pct: '1,6 %', oneIn: 63 });
    expect(formatChance(0.054)).toEqual({ pct: '5,4 %', oneIn: 19 });
    expect(formatChance(0.45)).toEqual({ pct: '45 %', oneIn: 2 });
  });

  it('gère une chance nulle', () => {
    expect(formatChance(0)).toEqual({ pct: '0 %', oneIn: null });
  });
});
