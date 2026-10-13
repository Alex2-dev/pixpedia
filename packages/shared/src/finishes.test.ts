import { describe, expect, it } from 'vitest';
import { RARITY_KEYS } from './constants';
import {
  DEFAULT_FINISH_ODDS,
  FINISHES,
  canRecycle,
  canSell,
  canTrade,
  finishOddsSchema,
  getCardBack,
  normalizeFinish,
  rollFinish,
} from './finishes';

describe('finitions', () => {
  it('existent en normale, holo, full art et Arène', () => {
    expect(FINISHES).toEqual(['normal', 'holo', 'fullart', 'arena']);
  });

  it('lit l’ancien nom « full_art »', () => {
    expect(normalizeFinish('full_art')).toBe('fullart');
    expect(normalizeFinish('holo')).toBe('holo');
    expect(normalizeFinish('worlds-2026')).toBe('normal');
    expect(normalizeFinish(undefined)).toBe('normal');
  });
});

describe('rollFinish (taux en configuration)', () => {
  const counts = (odds = DEFAULT_FINISH_ODDS) => {
    const c: Record<string, number> = {};
    for (let i = 0; i < 10_000; i++) {
      const f = rollFinish(() => i, odds);
      c[f] = (c[f] ?? 0) + 1;
    }
    return c;
  };

  it('holo 1 sur 20, full art 1 sur 100 par défaut, jamais Arène', () => {
    expect(counts()).toEqual({ fullart: 100, holo: 500, normal: 9400 });
  });

  it('suit les taux donnés', () => {
    expect(counts({ holo: 0.5, fullart: 0 })).toEqual({ holo: 5000, normal: 5000 });
  });

  it('valide la configuration', () => {
    expect(finishOddsSchema.safeParse(DEFAULT_FINISH_ODDS).success).toBe(true);
    expect(finishOddsSchema.safeParse({ holo: 0.9, fullart: 0.2 }).success).toBe(false);
    expect(finishOddsSchema.safeParse({ holo: -1, fullart: 0 }).success).toBe(false);
  });
});

describe('règles Arène et cartes liées', () => {
  const free = { finish: 'normal' as const, isBound: false };
  const arena = { finish: 'arena' as const, isBound: true };

  it('une carte Arène n’est jamais recyclable, échangeable ni vendable', () => {
    expect(canRecycle(arena)).toBe(false);
    expect(canTrade(arena)).toBe(false);
    expect(canSell(arena)).toBe(false);
    // Même si une donnée erronée la disait libre.
    expect(canRecycle({ finish: 'arena', isBound: false })).toBe(false);
    expect(canSell({ finish: 'arena', isBound: false })).toBe(false);
  });

  it('une carte libre, holo ou full art comprise, l’est', () => {
    for (const finish of ['normal', 'holo', 'fullart'] as const) {
      expect(canRecycle({ finish, isBound: false })).toBe(true);
      expect(canTrade({ finish, isBound: false })).toBe(true);
      expect(canSell({ finish, isBound: false })).toBe(true);
    }
    expect(canSell(free)).toBe(true);
  });

  it('une carte liée ne l’est jamais', () => {
    expect(canRecycle({ finish: 'holo', isBound: true })).toBe(false);
    expect(canTrade({ finish: 'normal', isBound: true })).toBe(false);
    expect(canSell({ finish: 'fullart', isBound: true })).toBe(false);
  });
});

describe('getCardBack (priorité des dos)', () => {
  it('Arène > Full art > Holo > VIP / événement > rareté > standard', () => {
    expect(getCardBack({ rarity: 'hof', finish: 'arena', variant: 'vip' })).toBe('arena');
    expect(getCardBack({ rarity: 'hof', finish: 'fullart', variant: 'vip' })).toBe('fullart');
    expect(getCardBack({ rarity: 'hof', finish: 'holo', variant: 'vip' })).toBe('holo');
    expect(getCardBack({ rarity: 'hof', finish: 'normal', variant: 'vip' })).toBe('vip');
    expect(getCardBack({ rarity: 'hof', finish: 'normal', variant: 'event' })).toBe('event');
    expect(getCardBack({ rarity: 'hof', finish: 'normal' })).toBe('hof');
    expect(getCardBack({ rarity: 'final', finish: 'normal' })).toBe('final');
    expect(getCardBack({ rarity: 'boss', finish: 'normal' })).toBe('boss');
  });

  it('Starter, Bonus et Combo ont le dos standard', () => {
    for (const rarity of ['starter', 'bonus', 'combo'] as const) {
      expect(getCardBack({ rarity, finish: 'normal' })).toBe('standard');
    }
  });

  it('pendant l’ouverture, toujours le dos standard (règle anti-fuite)', () => {
    for (const rarity of RARITY_KEYS) {
      for (const finish of FINISHES) {
        expect(getCardBack({ rarity, finish, variant: 'vip' }, { special: false })).toBe(
          'standard',
        );
      }
    }
  });
});
