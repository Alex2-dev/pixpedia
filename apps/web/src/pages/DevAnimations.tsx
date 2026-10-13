import { useState } from 'react';
import { DEFAULT_PACK_ODDS, formatChance, perCardChance, type Rarity } from '@pixpedia/shared';
import { DropOverlay } from '../components/drop/DropOverlay';
import { DEMO_BY_RARITY } from '../dev/fixtures';

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

      {drop && (
        <DropOverlay
          card={DEMO_BY_RARITY[drop]}
          chance={formatChance(perCardChance(drop, DEFAULT_PACK_ODDS))}
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
