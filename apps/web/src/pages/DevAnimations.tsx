import { useState } from 'react';
import {
  DEFAULT_PACK_ODDS,
  formatChance,
  perCardChance,
  rarityRank,
  type Rarity,
} from '@pixpedia/shared';
import { DropOverlay } from '../components/drop/DropOverlay';
import { HofBanner } from '../components/HofBanner';
import { DEMO_BY_RARITY, DEMO_ONE_PACK, DEMO_SEVEN_PACKS } from '../dev/fixtures';
import { PackOpening } from '../features/pack-opening/PackOpening';
import { localSource } from '../features/pack-opening/types';

const DROPS: { rarity: Rarity; label: string; color: string }[] = [
  { rarity: 'boss', label: 'Boss · ~1,4 s', color: '#A05CFF' },
  { rarity: 'final', label: 'Boss final · ~3 s', color: '#FF8A3D' },
  { rarity: 'hof', label: 'Hall of Fame · ~4,5 s', color: '#FFD23F' },
];

/** Page interne (dev seulement) pour valider les animations face aux maquettes. */
export function DevAnimations() {
  const [reduced, setReduced] = useState(false);
  const [firstHof, setFirstHof] = useState(false);
  const [drop, setDrop] = useState<Rarity | null>(null);
  const [cues, setCues] = useState<string[]>([]);
  const [opening, setOpening] = useState<{ count: number; run: number } | null>(null);
  const [banner, setBanner] = useState(false);
  const chance = (r: Rarity) => formatChance(perCardChance(r, DEFAULT_PACK_ODDS));

  return (
    <section className="dev-anim">
      <h1>Animations</h1>
      <p className="muted">Page interne : comparer avec docs/design/pixpedia-animations.html.</p>

      <div className="panel dev-controls">
        <label className="check">
          <input
            type="checkbox"
            checked={reduced}
            onChange={(e) => setReduced(e.target.checked)}
            data-testid="toggle-reduced"
          />
          Animations réduites
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={firstHof}
            onChange={(e) => setFirstHof(e.target.checked)}
          />
          Premier Hall of Fame (saut bloqué 1,5 s)
        </label>
      </div>

      <h2>Ouverture de packs</h2>
      <div className="dev-buttons">
        {[1, 7].map((count) => (
          <button
            key={count}
            type="button"
            className="btn"
            data-testid={`open-${count}`}
            onClick={() => setOpening({ count, run: Date.now() })}
          >
            ▶ {count} pack{count > 1 ? 's' : ''}
          </button>
        ))}
      </div>

      <h2>Annonce Hall of Fame</h2>
      <div className="dev-buttons">
        <button type="button" className="btn btn-ghost" onClick={() => setBanner(true)}>
          Afficher le bandeau
        </button>
      </div>

      <h2>Drops</h2>
      <div className="dev-buttons">
        {DROPS.map((d) => (
          <button
            key={d.rarity}
            type="button"
            className="btn"
            style={{ background: d.color }}
            data-testid={`play-${d.rarity}`}
            onClick={() => {
              setCues([]);
              setDrop(d.rarity);
            }}
          >
            ▶ {d.label}
          </button>
        ))}
      </div>
      {cues.length > 0 && (
        <p className="muted small" data-testid="cues">
          Signaux sonores : {cues.join(' → ')}
        </p>
      )}

      {opening && (
        <PackOpening
          key={opening.run}
          packCount={opening.count}
          packName="Pack des légendes"
          source={localSource(opening.count === 1 ? DEMO_ONE_PACK : DEMO_SEVEN_PACKS, rarityRank)}
          reduced={reduced}
          hofSeen={!firstHof}
          username="thedead"
          chance={chance}
          replayLabel="Rejouer"
          onAddToCodex={() => setOpening(null)}
          onReplay={() => setOpening({ ...opening, run: Date.now() })}
          onClose={() => setOpening(null)}
          onCue={(c) => setCues((all) => [...all, c])}
        />
      )}
      {banner && (
        <HofBanner
          drop={{ id: 1, username: 'thedead', cardId: 1, name: 'Starfall Odyssey', createdAt: '' }}
          onDismiss={() => setBanner(false)}
        />
      )}

      {drop && (
        <DropOverlay
          card={DEMO_BY_RARITY[drop]}
          chance={chance(drop)}
          mode="catalogue"
          reduced={reduced}
          firstHof={firstHof}
          ticker="THEDEAD A TIRÉ STARFALL ODYSSEY"
          onCue={(c) => setCues((all) => [...all, c])}
          onClose={() => setDrop(null)}
        />
      )}
    </section>
  );
}
