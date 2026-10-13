import type { Rarity } from '@pixpedia/shared';
import type { CardData } from '../card/types';

/** Données de démo (galerie, /dev/animations) : les cartes de la maquette. */
export const demoCard = (
  o: Partial<CardData> & Pick<CardData, 'id' | 'name' | 'rarity' | 'cost' | 'stats'>,
): CardData => ({
  number: `#${String(o.id).padStart(4, '0')}`,
  series: 'S1',
  year: 2000,
  platform: 'PC',
  family: 'action',
  cover: null,
  isNew: false,
  isBound: false,
  variant: 'normal',
  finish: 'normal',
  ...o,
});

export const DEMO_BY_RARITY: Record<Rarity, CardData> = {
  starter: demoCard({
    id: 112,
    name: 'Brick Valley',
    year: 1987,
    platform: 'NES',
    family: 'strategie',
    rarity: 'starter',
    cost: 1,
    stats: { atk: 34, def: 41, pv: 22, vit: 77 },
  }),
  bonus: demoCard({
    id: 287,
    name: 'Rally Sprint',
    year: 1997,
    platform: 'PS1',
    family: 'vitesse',
    rarity: 'bonus',
    cost: 2,
    stats: { atk: 52, def: 47, pv: 30, vit: 70 },
    isNew: true,
  }),
  combo: demoCard({
    id: 421,
    name: 'Castle Byte',
    year: 2003,
    family: 'aventure',
    rarity: 'combo',
    cost: 3,
    stats: { atk: 68, def: 55, pv: 61, vit: 39 },
  }),
  boss: demoCard({
    id: 655,
    name: 'Nebula Drift',
    year: 2009,
    rarity: 'boss',
    cost: 4,
    stats: { atk: 83, def: 58, pv: 47, vit: 62 },
    isNew: true,
  }),
  final: demoCard({
    id: 870,
    name: 'Iron Crown',
    year: 2011,
    platform: 'PS3',
    family: 'rpg',
    rarity: 'final',
    cost: 5,
    stats: { atk: 90, def: 77, pv: 72, vit: 35 },
  }),
  hof: demoCard({
    id: 999,
    name: 'Starfall Odyssey',
    year: 1998,
    platform: 'N64',
    family: 'rpg',
    rarity: 'hof',
    cost: 6,
    stats: { atk: 97, def: 94, pv: 91, vit: 12 },
    isNew: true,
  }),
};

const NAMES = [
  'Shadow Drift',
  'Iron Pinball',
  'Castle Hunter',
  'Lunar Forge',
  'Pixel Byte',
  'Neon Rally',
  'Crystal Quest',
  'Sky Tactics',
  'Rune Racer',
  'Moss Kingdom',
  'Void Arena',
  'Ember Saga',
];

/** Pack de démo : 5 cartes des raretés données, dans le désordre (la plus rare sortira en dernier). */
function demoPack(pack: number, rarities: Rarity[]) {
  return rarities.map((rarity, i) => {
    const base = DEMO_BY_RARITY[rarity];
    const id = pack * 10 + i;
    return {
      pack,
      rarity,
      isNew: (id * 7) % 3 === 0,
      card: {
        ...base,
        id,
        number: `#${String(2000 + id).padStart(4, '0')}`,
        name: NAMES[id % NAMES.length]!,
        isNew: false,
      },
    };
  });
}

/** 1 pack : Starter, Bonus, Combo, Boss final, Boss. */
export const DEMO_ONE_PACK = demoPack(1, ['final', 'starter', 'boss', 'bonus', 'combo']);

/** 7 packs (35 cartes), dont un Boss, un Boss final et un Hall of Fame. */
export const DEMO_SEVEN_PACKS = [
  demoPack(1, ['starter', 'starter', 'bonus', 'starter', 'combo']),
  demoPack(2, ['boss', 'starter', 'bonus', 'starter', 'bonus']),
  demoPack(3, ['starter', 'starter', 'starter', 'bonus', 'combo']),
  demoPack(4, ['starter', 'final', 'bonus', 'starter', 'combo']),
  demoPack(5, ['starter', 'starter', 'starter', 'bonus', 'bonus']),
  demoPack(6, ['bonus', 'starter', 'hof', 'starter', 'combo']),
  demoPack(7, ['starter', 'bonus', 'starter', 'starter', 'combo']),
].flat();
