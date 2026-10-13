import { RARITY_KEYS, rarityRank, type Rarity } from '@pixpedia/shared';
import { Card } from '../../card/Card';
import { RARITY_STYLE } from '../../card/types';
import type { OpeningCard } from './types';

const HOLO = 'conic-gradient(from 200deg,#2EE6FF,#A05CFF,#FF4FB0,#FFD23F,#2EE6FF)';
const color = (r: Rarity) => (r === 'hof' ? HOLO : RARITY_STYLE[r].color);

export interface RevealRecapProps {
  cards: readonly OpeningCard[];
  packCount: number;
  onAddToCodex: () => void;
  onReplay: () => void;
  replayLabel: string;
}

/**
 * Récap : compteur par rareté, meilleures cartes (toutes pour 1 pack, Combo et plus au-delà),
 * nombre de nouvelles, « Ajouter au codex » et « Rejouer ».
 */
export function RevealRecap({
  cards,
  packCount,
  onAddToCodex,
  onReplay,
  replayLabel,
}: RevealRecapProps) {
  const counts = new Map<Rarity, number>();
  for (const c of cards) counts.set(c.rarity, (counts.get(c.rarity) ?? 0) + 1);
  const best = (
    packCount === 1 ? [...cards] : cards.filter((c) => rarityRank(c.rarity) >= rarityRank('combo'))
  )
    .slice()
    .sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity));
  const nNew = cards.filter((c) => c.isNew).length;
  const others = cards.length - best.length;

  return (
    <div data-testid="recap">
      <div className="op-chips op-rc">
        {RARITY_KEYS.filter((r) => counts.get(r)).map((r) => (
          <div key={r} className="op-chip">
            <span className="op-chip-dot" style={{ background: color(r) }} />
            <span>{RARITY_STYLE[r].label.toUpperCase()}</span>
            <span style={{ fontSize: 10 }}>×{counts.get(r)}</span>
          </div>
        ))}
      </div>
      <div className="op-best">
        {best.map((c, i) => (
          <div
            key={i}
            className="op-best-card op-rc"
            style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}
          >
            {rarityRank(c.rarity) >= rarityRank('combo') && (
              <div className="op-best-glow" style={{ background: color(c.rarity) }} />
            )}
            <Card data={c.card} width={104} tilt={false} onActivate={() => {}} />
          </div>
        ))}
      </div>
      <div className="op-news op-rc" style={{ animationDelay: '0.5s' }}>
        <div>
          {nNew} NOUVELLE{nNew > 1 ? 'S' : ''} CARTE{nNew > 1 ? 'S' : ''}
        </div>
        {packCount > 1 && others > 0 && (
          <div style={{ color: '#A79DB3' }}>
            + {others} carte{others > 1 ? 's' : ''} commune{others > 1 ? 's' : ''}
          </div>
        )}
      </div>
      <div className="op-bottom">
        <button type="button" className="op-btn" onClick={onAddToCodex}>
          AJOUTER AU CODEX
        </button>
        <button type="button" className="op-btn-ghost" onClick={onReplay}>
          {replayLabel}
        </button>
      </div>
    </div>
  );
}
