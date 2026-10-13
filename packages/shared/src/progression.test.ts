import { describe, expect, it } from 'vitest';
import {
  SET_TYPES,
  SHARDS_PER_DUPLICATE,
  recyclableCopies,
  rarityFallbackOrder,
  recycleValue,
} from './progression';

describe('types de sets', () => {
  it('couvre plateforme, décennie, année, genre, thème, développeur, éditeur et franchise', () => {
    expect(SET_TYPES.map((t) => t.type)).toEqual([
      'platform',
      'decade',
      'year',
      'genre',
      'theme',
      'developer',
      'publisher',
      'franchise',
    ]);
  });
});

describe('recyclage des doublons (spec §5.6)', () => {
  it('donne des éclats selon la rareté', () => {
    expect(SHARDS_PER_DUPLICATE).toEqual({
      starter: 1,
      bonus: 3,
      combo: 10,
      boss: 40,
      final: 150,
      hof: 500,
    });
    expect(recycleValue('boss', 3)).toBe(120);
  });

  it('garde toujours un exemplaire de chaque carte et finition', () => {
    expect(recyclableCopies({ quantity: 1, isBound: false })).toBe(0);
    expect(recyclableCopies({ quantity: 4, isBound: false })).toBe(3);
  });

  it('ne recycle jamais une carte liée (spec §17.4)', () => {
    expect(recyclableCopies({ quantity: 5, isBound: true })).toBe(0);
  });
});

describe('rarityFallbackOrder', () => {
  it('essaie la rareté tirée, puis en dessous, puis au-dessus', () => {
    expect(rarityFallbackOrder('combo')).toEqual([
      'combo',
      'bonus',
      'starter',
      'boss',
      'final',
      'hof',
    ]);
    expect(rarityFallbackOrder('starter')).toEqual([
      'starter',
      'bonus',
      'combo',
      'boss',
      'final',
      'hof',
    ]);
    expect(rarityFallbackOrder('hof')).toEqual([
      'hof',
      'final',
      'boss',
      'combo',
      'bonus',
      'starter',
    ]);
  });
});
