import { describe, expect, it } from 'vitest';
import { DEFAULT_PACK_ODDS } from './packs';
import { formatChance, getRevealAnimation, perCardChance } from './reveal';

describe('getRevealAnimation', () => {
  it('retournement simple de 0,4 s pour Starter et Bonus', () => {
    expect(getRevealAnimation('starter')).toEqual({ kind: 'flip', durationMs: 400 });
    expect(getRevealAnimation('bonus')).toEqual({ kind: 'flip', durationMs: 400 });
  });

  it('retournement avec halo bleu de 0,5 s pour Combo', () => {
    expect(getRevealAnimation('combo')).toEqual({ kind: 'flip-halo', durationMs: 500 });
  });

  it('drop plein écran pour Boss, Boss final et Hall of Fame', () => {
    expect(getRevealAnimation('boss')).toEqual({ kind: 'drop', drop: 'boss', durationMs: 1400 });
    expect(getRevealAnimation('final')).toEqual({ kind: 'drop', drop: 'final', durationMs: 3000 });
    expect(getRevealAnimation('hof')).toEqual({ kind: 'drop', drop: 'hof', durationMs: 4500 });
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
