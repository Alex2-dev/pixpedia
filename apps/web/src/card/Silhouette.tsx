import type { CardView } from '@pixpedia/shared';
import { CARD_H, CARD_W } from './Card';
import { Logo, step } from './pixel';
import { RARITY_STYLE } from './types';

/** Carte manquante d'un set, en silhouette (spec §5.7) : on sait quel jeu manque, pas à quoi il ressemble. */
export function Silhouette({ card, width = CARD_W }: { card: CardView; width?: number }) {
  const color = RARITY_STYLE[card.rarity].color;
  return (
    <div
      className="pxcard-box"
      style={{ width, height: width * (CARD_H / CARD_W) }}
      aria-label={`${card.name}, carte manquante`}
      role="img"
    >
      <div
        className="silhouette"
        style={{ transform: `scale(${width / CARD_W})`, clipPath: step(6) }}
      >
        <div className="silhouette__inner" style={{ clipPath: step(4) }}>
          <span className="silhouette__rarity px-label" style={{ color }}>
            {RARITY_STYLE[card.rarity].label}
          </span>
          <Logo size={72} col="#3A3147" acc="#2E2639" />
          <span className="silhouette__number px-label">{card.number}</span>
          <span className="silhouette__name">{card.name}</span>
          <span className="px-label muted">{card.year ?? ''}</span>
        </div>
      </div>
    </div>
  );
}
