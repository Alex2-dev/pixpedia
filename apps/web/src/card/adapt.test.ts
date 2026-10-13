import { describe, expect, it } from 'vitest';
import type { CardView } from '@pixpedia/shared';
import { toCardData } from './adapt';

const view: CardView = {
  cardId: 655,
  gameId: 1942,
  number: '#0655',
  seriesCode: 'S0',
  name: 'The Witcher 3: Wild Hunt',
  year: 2015,
  platform: 'PC',
  rarity: 'hof',
  rarityLabel: 'Hall of Fame',
  cost: 6,
  family: 'rpg',
  familyLabel: 'RPG',
  atk: 98,
  def: 99,
  hp: 95,
  spd: 14,
  coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg',
};

describe('toCardData', () => {
  it('reprend les champs du design, PV = hp et VIT = spd', () => {
    expect(toCardData(view)).toEqual({
      id: 655,
      number: '#0655',
      series: 'S0',
      name: 'The Witcher 3: Wild Hunt',
      year: 2015,
      platform: 'PC',
      family: 'rpg',
      rarity: 'hof',
      cost: 6,
      stats: { atk: 98, def: 99, pv: 95, vit: 14 },
      cover: view.coverUrl,
      isNew: false,
      isBound: false,
      finish: 'normal',
      variant: 'normal',
    });
  });

  it('garde les infos de l’exemplaire', () => {
    expect(toCardData({ ...view, finish: 'holo', isNew: true, isBound: true })).toMatchObject({
      finish: 'holo',
      isNew: true,
      isBound: true,
    });
  });

  it('affiche une finition inconnue comme normale', () => {
    expect(toCardData({ ...view, finish: 'worlds-2026' }).finish).toBe('normal');
  });
});
