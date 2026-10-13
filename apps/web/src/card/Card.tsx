import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { CardBack, CardFront } from './fronts';
import { RARITY_STYLE, type CardData } from './types';
import './card.css';

/** Taille de référence du design ; les autres tailles sont obtenues par mise à l'échelle. */
export const CARD_W = 240;
export const CARD_H = 336;
/** Demi-retournement : la face change à mi-course (90°). */
const HALF_TURN_MS = 250;

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
  /**
   * Dos spécial (rareté, finition, édition) : classeur, fiche catalogue, vitrine.
   * Jamais pendant l'ouverture de packs, où toutes les cartes ont le dos standard.
   */
  specialBack?: boolean;
}

type Turn = 'idle' | 'out' | 'in';

/**
 * Carte retournable. Une seule face est rendue à la fois (pas de backface-visibility, à cause
 * du bug de Safari iOS) : la carte pivote jusqu'à 90°, la face change, puis elle revient.
 * Face cachée, aucune information de la carte n'est présente dans le DOM.
 */
export function Card({
  data,
  width = CARD_W,
  flipped,
  onActivate,
  tilt = true,
  specialBack = false,
}: CardProps) {
  const [selfFlipped, setSelfFlipped] = useState(false);
  const target = (flipped ?? selfFlipped) ? 'back' : 'front';
  const [shown, setShown] = useState<'front' | 'back'>(target);
  const [turn, setTurn] = useState<Turn>('idle');
  const tiltRef = useRef<HTMLDivElement>(null);
  const scale = width / CARD_W;

  // Retournement en deux temps : la face visible change à mi-rotation.
  useEffect(() => {
    if (target === shown) return;
    if (reducedMotion()) {
      const t = setTimeout(() => setShown(target));
      return () => clearTimeout(t);
    }
    const timers = [
      setTimeout(() => setTurn('out')),
      setTimeout(() => {
        setShown(target);
        setTurn('in');
      }, HALF_TURN_MS),
      setTimeout(() => setTurn('idle'), HALF_TURN_MS * 2),
    ];
    return () => timers.forEach(clearTimeout);
  }, [target, shown]);

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

  const front = shown === 'front';
  // Sans dos spécial, une carte face cachée ne dit rien d'elle-même (règle anti-fuite).
  const label = front
    ? `${data.name}, ${RARITY_STYLE[data.rarity].label}`
    : specialBack
      ? `${data.name}, dos de la carte`
      : 'Carte face cachée';

  return (
    <div className="pxcard-box" style={{ width, height: width * (CARD_H / CARD_W) }}>
      <div
        className="pxcard"
        data-rarity={front ? data.rarity : undefined}
        data-face={shown}
        role="button"
        tabIndex={0}
        aria-label={label}
        style={{ transform: `scale(${scale})` }}
        onClick={activate}
        onKeyDown={onKey}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <div className="pxcard__tilt" ref={tiltRef}>
          <div className={`pxcard__inner${turn === 'idle' ? '' : ` pxcard__inner--${turn}`}`}>
            <div className="pxcard__face">
              {front ? <CardFront data={data} /> : <CardBack data={data} special={specialBack} />}
            </div>
          </div>
          <div className="pxcard__shine" />
        </div>
      </div>
    </div>
  );
}
