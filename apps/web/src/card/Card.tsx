import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { CardBack, CardFront } from './fronts';
import { RARITY_STYLE, type CardData } from './types';
import './card.css';

/** Taille de référence du design ; les autres tailles sont obtenues par mise à l'échelle. */
export const CARD_W = 240;
export const CARD_H = 336;

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface CardProps {
  data: CardData;
  /** Largeur affichée en px (240 = taille du design). */
  width?: number;
  /** Retournement contrôlé ; sans cette prop, la carte se retourne au clic. */
  flipped?: boolean;
  /** Remplace le retournement au clic (ex. ouvrir le détail). */
  onActivate?: () => void;
  /** Suit le pointeur en 3D. */
  tilt?: boolean;
}

export function Card({ data, width = CARD_W, flipped, onActivate, tilt = true }: CardProps) {
  const [selfFlipped, setSelfFlipped] = useState(false);
  const tiltRef = useRef<HTMLDivElement>(null);
  const isFlipped = flipped ?? selfFlipped;
  const scale = width / CARD_W;

  const activate = () => (onActivate ? onActivate() : setSelfFlipped((f) => !f));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!tilt || !el || reducedMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${((0.5 - y) * 18).toFixed(1)}deg`);
    el.style.setProperty('--ry', `${((x - 0.5) * 22).toFixed(1)}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  };
  const onLeave = () => {
    tiltRef.current?.style.setProperty('--rx', '0deg');
    tiltRef.current?.style.setProperty('--ry', '0deg');
  };

  return (
    <div className="pxcard-box" style={{ width, height: width * (CARD_H / CARD_W) }}>
      <div
        className={`pxcard${isFlipped ? ' is-flipped' : ''}`}
        data-rarity={data.rarity}
        role="button"
        tabIndex={0}
        aria-label={`${data.name}, ${RARITY_STYLE[data.rarity].label}${isFlipped ? ' (face cachée)' : ''}`}
        style={{ transform: `scale(${scale})` }}
        onClick={activate}
        onKeyDown={onKey}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <div className="pxcard__tilt" ref={tiltRef}>
          <div className="pxcard__inner">
            <div className="pxcard__face pxcard__front">
              <CardFront data={data} />
            </div>
            <div className="pxcard__face pxcard__back">
              <CardBack data={data} />
            </div>
          </div>
          <div className="pxcard__shine" />
        </div>
      </div>
    </div>
  );
}
