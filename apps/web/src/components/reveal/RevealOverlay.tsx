import { useCallback, useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import {
  REVEAL_STEP_MS,
  getRevealAnimation,
  overlaySteps,
  type OverlayStep,
  type RevealStep,
} from '@pixpedia/shared';
import type { CardData } from '../../card/types';
import { FIRST_HOF_SKIP_LOCK_MS } from './stepSequence';
import { BossDrop } from './drops/BossDrop';
import { FinalDrop } from './drops/FinalDrop';
import { HofDrop } from './drops/HofDrop';
import { ArenaFinish } from './finishes/ArenaFinish';
import { FullArtFinish } from './finishes/FullArtFinish';
import { HoloFinish } from './finishes/HoloFinish';
import type { SceneProps } from './drops/shared';
import { useRevealSequence } from './useRevealSequence';
import { useStepSequence, type CueAt, type RevealCue } from './useStepSequence';
import { useStageScale } from './useStageScale';
import './reveal.css';

/** Signaux sonores de chaque étape, aux moments clés des timelines des maquettes (ms). */
const CUES: Partial<Record<OverlayStep, readonly CueAt[]>> = {
  'drop-boss': [
    { at: 0, cue: 'rumble' },
    { at: 720, cue: 'impact' },
  ],
  'drop-final': [
    { at: 100, cue: 'rumble' },
    { at: 650, cue: 'crack' },
    { at: 1250, cue: 'explode' },
    { at: 1800, cue: 'slam' },
    { at: 2150, cue: 'crown' },
    { at: 2350, cue: 'title' },
  ],
  'drop-hof': [
    { at: 200, cue: 'rumble' },
    { at: 1000, cue: 'crack' },
    { at: 1600, cue: 'explode' },
    { at: 2400, cue: 'fanfare' },
    { at: 2700, cue: 'firework' },
    { at: 3050, cue: 'firework' },
    { at: 3300, cue: 'trophy' },
    { at: 3400, cue: 'firework' },
    { at: 3750, cue: 'firework' },
    { at: 4100, cue: 'firework' },
  ],
  'finish-holo': [
    { at: 500, cue: 'flip' },
    { at: 850, cue: 'shimmer' },
    { at: 1150, cue: 'stamp' },
  ],
  'finish-fullart': [
    { at: 0, cue: 'curtain' },
    { at: 300, cue: 'flip' },
    { at: 1000, cue: 'spotlight' },
    { at: 2000, cue: 'shimmer' },
    { at: 2200, cue: 'title' },
  ],
  'finish-arena': [
    { at: 200, cue: 'spotlight' },
    { at: 1350, cue: 'flip' },
    { at: 1400, cue: 'cheer' },
    { at: 1650, cue: 'title' },
  ],
};

/** Scènes plein écran par étape. */
const SCENES: Record<OverlayStep, (p: SceneProps) => ReactNode> = {
  'drop-boss': BossDrop,
  'drop-final': FinalDrop,
  'drop-hof': HofDrop,
  'finish-holo': HoloFinish,
  'finish-fullart': FullArtFinish,
  'finish-arena': ArenaFinish,
};

/**
 * Moment où le recto apparaît dans chaque finition (ms). Jouée après un drop, la finition
 * démarre là : le recto est déjà visible, le dos et le retournement sont sautés.
 */
const FACE_AT: Partial<Record<OverlayStep, number>> = {
  'finish-holo': 500,
  'finish-fullart': 300,
  'finish-arena': 1350,
};

const ACCENT: Record<OverlayStep, string> = {
  'drop-boss': '#A05CFF',
  'drop-final': '#FF8A3D',
  'drop-hof': '#FFD23F',
  'finish-holo': '#A05CFF',
  'finish-fullart': '#F5E3B0',
  'finish-arena': '#FF4FB0',
};
/** Apparition du bouton du bas, selon la maquette. */
const CTA_DELAY: Record<OverlayStep, string> = {
  'drop-boss': '1.4s',
  'drop-final': '3.1s',
  'drop-hof': '4.2s',
  'finish-holo': '1.7s',
  'finish-fullart': '3s',
  'finish-arena': '2.1s',
};

/** Étapes plein écran d'une carte. */
export function revealChainOf(card: CardData, steps?: readonly RevealStep[]): OverlayStep[] {
  return overlaySteps(steps ?? getRevealAnimation(card.rarity, card.finish));
}

/** La carte se révèle en plein écran (drop ou finition) plutôt que par un simple retournement. */
export const hasRevealOverlay = (card: CardData) => revealChainOf(card).length > 0;

export interface RevealOverlayProps {
  card: CardData;
  /** Étapes à jouer ; par défaut celles de la rareté et de la finition de la carte. */
  steps?: readonly RevealStep[];
  chance: SceneProps['chance'];
  /** « opening » : bouton « Ajouter au codex ». « catalogue » : « Rejouer » et « Fermer ». */
  mode: 'opening' | 'catalogue';
  /** prefers-reduced-motion ou option « Animations réduites » du profil. */
  reduced: boolean;
  /** Premier Hall of Fame du joueur : saut bloqué 1,5 s. */
  firstHof?: boolean;
  ticker?: string;
  onClose: () => void;
  onCue?: (cue: RevealCue) => void;
  /** Appelé quand l'animation d'un Hall of Fame a été vue jusqu'à son état final. */
  onHofSeen?: () => void;
}

interface StepControl {
  final: boolean;
  skip: () => void;
}

function StepRun({
  step,
  index,
  last,
  props,
  onControl,
  onDone,
  onReplay,
}: {
  step: OverlayStep;
  index: number;
  last: boolean;
  props: RevealOverlayProps;
  onControl: (c: StepControl) => void;
  onDone: () => void;
  onReplay: () => void;
}) {
  // Finition jouée après un drop : on avance sa timeline jusqu'à l'apparition du recto.
  const after = index > 0 ? (FACE_AT[step] ?? 0) : 0;
  const cues = useMemo(
    () => CUES[step]?.filter((c) => c.at >= after).map((c) => ({ ...c, at: c.at - after })),
    [step, after],
  );
  const { phase, final, skip } = useStepSequence({
    durationMs: REVEAL_STEP_MS[step] - after,
    skipLockMs: step === 'drop-hof' && props.firstHof ? FIRST_HOF_SKIP_LOCK_MS : 0,
    reduced: props.reduced,
    cues,
    onCue: props.onCue,
    onDone: (how) => {
      if (step === 'drop-hof') props.onHofSeen?.();
      // Fin naturelle d'une étape intermédiaire : on enchaîne la suivante.
      if (how === 'done' && !last) onDone();
    },
  });
  useEffect(() => onControl({ final, skip }), [final, skip, onControl]);
  const Scene = SCENES[step];
  const scale = useStageScale();
  return (
    <div
      className={`dp-stage${props.reduced ? ' dp-reduced' : ''}`}
      // Saut ou mode réduit seulement : à la fin naturelle, les boucles continuent d'elles-mêmes.
      data-final={phase === 'skipped' || undefined}
      data-testid="drop-stage"
      data-step={step}
      data-after={after > 0 || undefined}
      data-state={final ? 'final' : 'playing'}
      style={{ '--dp-scale': scale, '--after': `${after / 1000}s` } as CSSProperties}
    >
      <Scene card={props.card} chance={props.chance} ticker={props.ticker} />
      {last && (
        <div
          className={`dp-actions${props.mode === 'opening' ? ' dp-cta' : ''}`}
          style={{ '--cta-delay': `calc(${CTA_DELAY[step]} - var(--after, 0s))` } as CSSProperties}
          onClick={(e) => e.stopPropagation()}
        >
          {props.mode === 'opening' ? (
            <button
              type="button"
              className="dp-btn"
              style={{ background: ACCENT[step] }}
              onClick={props.onClose}
            >
              AJOUTER AU CODEX
            </button>
          ) : (
            <div className="dp-row">
              <button type="button" className="dp-btn-ghost" onClick={onReplay}>
                Rejouer
              </button>
              <button
                type="button"
                className="dp-btn"
                style={{ background: ACCENT[step] }}
                onClick={props.onClose}
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Révélation plein écran : drop de rareté (Boss, Boss final, Hall of Fame) puis effet de
 * finition, enchaînés. Un toucher saute l'étape en cours (vers la suivante, ou vers l'état
 * final de la dernière) ; ensuite, en mode ouverture, un toucher referme.
 */
export function RevealOverlay(props: RevealOverlayProps) {
  const { card, steps } = props;
  const chain = useMemo(() => revealChainOf(card, steps), [card, steps]);
  const seq = useRevealSequence(chain, props.reduced);
  const control = useRef<StepControl>({ final: false, skip: () => {} });
  const rootRef = useRef<HTMLDivElement>(null);
  const onControl = useCallback((c: StepControl) => {
    control.current = c;
  }, []);

  useEffect(() => {
    rootRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (!seq.step) return null;

  const activate = () => {
    const { final, skip } = control.current;
    if (!seq.last) {
      // Le saut d'une étape intermédiaire respecte le blocage du premier Hall of Fame.
      if (final || seq.step !== 'drop-hof' || !props.firstHof) seq.next();
      else skip();
      return;
    }
    if (!final) skip();
    else if (props.mode === 'opening') props.onClose();
  };

  return (
    <div
      ref={rootRef}
      className="dp-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Révélation : ${card.name}`}
      tabIndex={-1}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && props.mode === 'catalogue') props.onClose();
        else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      }}
    >
      <StepRun
        key={seq.key}
        step={seq.step}
        index={seq.index}
        last={seq.last}
        props={props}
        onControl={onControl}
        onDone={seq.next}
        onReplay={seq.replay}
      />
    </div>
  );
}
