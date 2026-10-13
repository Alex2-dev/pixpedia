import { describe, expect, it } from 'vitest';
import { rarityRank, type Rarity } from '@pixpedia/shared';
import { revealOrder, tearDurationMs, type OpeningCard } from './types';

const card = (pack: number, rarity: Rarity, name: string): OpeningCard => ({
  pack,
  rarity,
  isNew: false,
  card: { name } as OpeningCard['card'],
});

describe('tearDurationMs', () => {
  it('suit la maquette : 1,75 s pour 1 pack, 3,26 s pour 7', () => {
    expect(tearDurationMs(1)).toBe(1750);
    expect(tearDurationMs(7)).toBe(3260);
    expect(tearDurationMs(2)).toBe(1360);
  });
});

describe('revealOrder', () => {
  it('garde l’ordre des packs et sort la plus rare de chaque pack en dernier', () => {
    const order = revealOrder(
      [
        card(1, 'boss', 'A'),
        card(1, 'starter', 'B'),
        card(1, 'combo', 'C'),
        card(2, 'hof', 'D'),
        card(2, 'bonus', 'E'),
      ],
      rarityRank,
    );
    expect(order.map((c) => c.card.name)).toEqual(['B', 'C', 'A', 'E', 'D']);
  });

  it('est stable entre cartes de même rareté', () => {
    const order = revealOrder([card(1, 'starter', 'X'), card(1, 'starter', 'Y')], rarityRank);
    expect(order.map((c) => c.card.name)).toEqual(['X', 'Y']);
  });
});
