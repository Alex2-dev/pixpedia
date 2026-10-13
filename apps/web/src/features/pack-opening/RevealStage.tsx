import { REVEAL_STEP_MS, getRevealAnimation, rarityRank } from '@pixpedia/shared';
import { Card } from '../../card/Card';
import { DropBack } from '../../components/drop/drops/shared';
import { RARITY_STYLE } from '../../card/types';
import type { OpeningCard } from './types';

export interface RevealStageProps {
  item: OpeningCard;
  /** Carte retournée face visible. */
  up: boolean;
  /** Retournée par un drop plein écran : on ne rejoue pas le retournement. */
  afterDrop: boolean;
  /** Chance par carte de la rareté, ex. « 5,4 % ». */
  pct: string;
  remaining: number;
  onTap: () => void;
  onRevealAll: () => void;
}

const LABEL_COLOR: Record<string, string> = { hof: '#FFD23F' };

/**
 * Carte face cachée au centre, seule, qui respire. 1er toucher : retournement (ou drop plein
 * écran, géré par PackOpening). 2e toucher : carte suivante.
 */
export function RevealStage({
  item,
  up,
  afterDrop,
  pct,
  remaining,
  onTap,
  onRevealAll,
}: RevealStageProps) {
  const steps = getRevealAnimation(item.rarity);
  const flipMs = REVEAL_STEP_MS[steps[0]!];
  const style = RARITY_STYLE[item.rarity];
  const halo = rarityRank(item.rarity) >= rarityRank('combo');
  const rare = rarityRank(item.rarity) >= rarityRank('boss');

  return (
    <>
      {up ? (
        <div data-testid="reveal-up" data-rarity={item.rarity}>
          {rare && <div className="op-rv-rays" />}
          <div
            className="op-card"
            role="button"
            tabIndex={0}
            aria-label={`${item.card.name}, ${style.label}. Carte suivante`}
            onClick={onTap}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onTap())}
          >
            {halo && (
              <div
                className="op-rv-glow"
                style={{
                  background:
                    item.rarity === 'hof'
                      ? 'conic-gradient(from 200deg,#2EE6FF,#A05CFF,#FF4FB0,#FFD23F,#2EE6FF)'
                      : style.color,
                }}
              />
            )}
            <div
              className={`op-rv-front${afterDrop ? ' op-after-drop' : ''}`}
              style={{ animationDuration: `${flipMs}ms` }}
            >
              <Card data={item.card} width={240} tilt={false} onActivate={() => {}} />
            </div>
          </div>
          <div className="op-rv-lab">
            <div className="op-rv-name" style={{ color: LABEL_COLOR[item.rarity] ?? style.color }}>
              {style.label.toUpperCase()}
            </div>
            <div className="op-hint">{pct} PAR CARTE</div>
          </div>
        </div>
      ) : (
        <div data-testid="reveal-down">
          <div
            key={item.card.id + '-' + item.pack}
            className="op-card op-rv op-rv-breath"
            role="button"
            tabIndex={0}
            aria-label="Retourner la carte"
            onClick={onTap}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onTap())}
          >
            <DropBack />
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 510, textAlign: 'center' }}>
            <span className="op-hint">TOUCHE LA CARTE</span>
          </div>
        </div>
      )}

      <div className="op-left">
        <span className="op-hint" data-testid="left-line">
          {remaining > 0
            ? `ENCORE ${remaining} CARTE${remaining > 1 ? 'S' : ''}`
            : 'DERNIÈRE CARTE'}
        </span>
      </div>
      <div className="op-bottom">
        <button type="button" className="op-btn" onClick={onRevealAll} data-testid="reveal-all">
          Tout révéler
        </button>
      </div>
    </>
  );
}
