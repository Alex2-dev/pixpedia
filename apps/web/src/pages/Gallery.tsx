import { Card } from '../card/Card';
import type { CardData } from '../card/types';
import { demoCard } from '../dev/fixtures';

/** Galerie de dev : les cartes de démo du design, pour comparer le rendu. */
const base = demoCard;

const CARDS: CardData[] = [
  base({
    id: 112,
    name: 'Brick Valley',
    year: 1987,
    platform: 'NES',
    family: 'strategie',
    rarity: 'starter',
    cost: 1,
    stats: { atk: 34, def: 41, pv: 22, vit: 77 },
  }),
  base({
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
  base({
    id: 421,
    name: 'Castle Byte',
    year: 2003,
    family: 'aventure',
    rarity: 'combo',
    cost: 3,
    stats: { atk: 68, def: 55, pv: 61, vit: 39 },
    finish: 'holo',
  }),
  base({
    id: 655,
    name: 'Nebula Drift',
    year: 2009,
    rarity: 'boss',
    cost: 4,
    stats: { atk: 83, def: 58, pv: 47, vit: 62 },
    isNew: true,
  }),
  base({
    id: 870,
    name: 'Iron Crown',
    year: 2011,
    platform: 'PS3',
    family: 'rpg',
    rarity: 'final',
    cost: 5,
    stats: { atk: 90, def: 77, pv: 72, vit: 35 },
    finish: 'fullart',
  }),
  base({
    id: 999,
    name: 'Starfall Odyssey',
    year: 1998,
    platform: 'N64',
    family: 'rpg',
    rarity: 'hof',
    cost: 6,
    stats: { atk: 97, def: 94, pv: 91, vit: 12 },
  }),
  base({
    id: 421,
    name: 'Castle Byte',
    year: 2003,
    family: 'aventure',
    rarity: 'combo',
    cost: 3,
    stats: { atk: 68, def: 55, pv: 61, vit: 39 },
    variant: 'vip',
    isBound: true,
  }),
  base({
    id: 3001,
    number: '#EV-W26',
    series: 'WORLDS',
    name: 'Team Nova',
    year: 2026,
    platform: null,
    family: null,
    rarity: 'bonus',
    cost: 2,
    stats: { atk: 0, def: 0, pv: 0, vit: 0 },
    isBound: true,
    event: {
      name: 'Worlds 2026',
      region: 'EU',
      seed: 1,
      index: 3,
      total: 16,
      steps: [
        { label: 'Groupes', done: true },
        { label: 'Quarts', done: true },
        { label: 'Demi', done: true },
        { label: 'Finale', done: false },
      ],
    },
  }),
];

export function Gallery() {
  return (
    <section>
      <h1>Galerie des cartes</h1>
      <p className="muted">Clique pour retourner, survole pour incliner.</p>
      <div className="gallery">
        {CARDS.map((c, i) => (
          <Card key={i} data={c} />
        ))}
      </div>
    </section>
  );
}
