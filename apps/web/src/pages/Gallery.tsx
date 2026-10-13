import { CardBack } from '../card/fronts';
import { Card } from '../card/Card';
import type { CardData } from '../card/types';
import { DEMO_BY_RARITY, demoCard } from '../dev/fixtures';

/** Cartes de la maquette pixpedia-cartes-animations.html : rectos, éditions et leurs dos. */
export const GALLERY: { title: string; card: CardData }[] = [
  ...(['starter', 'bonus', 'combo', 'boss', 'final', 'hof'] as const).map((r) => ({
    title: DEMO_BY_RARITY[r].rarity.toUpperCase(),
    card: { ...DEMO_BY_RARITY[r], isNew: false },
  })),
  { title: 'HOLO', card: { ...DEMO_BY_RARITY.combo, finish: 'holo' } },
  { title: 'FULL ART', card: { ...DEMO_BY_RARITY.boss, isNew: false, finish: 'fullart' } },
  {
    title: 'ÉDITION ARÈNE',
    card: {
      ...DEMO_BY_RARITY.final,
      finish: 'arena',
      isBound: true,
      eventName: 'Worlds 2026',
      obtainedAt: '2026-10-12T12:00:00Z',
    },
  },
  { title: 'VARIANTE VIP', card: { ...DEMO_BY_RARITY.combo, variant: 'vip', isBound: true } },
  {
    title: 'CARTE ÉQUIPE (ÉVÉNEMENT)',
    card: demoCard({
      id: 3001,
      number: '#EV-W26',
      series: 'S1',
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
  },
];

/** Galerie de dev : chaque carte, recto et dos spécial côte à côte, à comparer avec la maquette. */
export function Gallery() {
  return (
    <section>
      <h1>Galerie des cartes</h1>
      <p className="muted">Recto à gauche, dos spécial à droite. Clique pour retourner.</p>
      <div className="gallery">
        {GALLERY.map(({ title, card }) => (
          <figure key={title} className="gallery-item" data-testid={`gallery-${title}`}>
            <div className="gallery-pair">
              <Card data={card} specialBack />
              <div className="pxcard-box" style={{ width: 240, height: 336 }}>
                <CardBack data={card} special />
              </div>
            </div>
            <figcaption className="px-label muted">{title}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
