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
import type { SceneProps } from './drops/shared';
import { useRevealSequence } from './useRevealSequence';
import { useStepSequence, type CueAt, type RevealCue } from './useStepSequence';
import { useStageScale } from './useStageScale';
import './reveal.css';

/** Signaux sonores de chaque drop, aux moments clés des timelines de la maquette (ms). */
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
};

/** Scènes plein écran par étape. Les finitions arrivent avec leurs animations. */
const SCENES: Partial<Record<OverlayStep, (p: SceneProps) => ReactNode>> = {
  'drop-boss': BossDrop,
  'drop-final': FinalDrop,
  'drop-hof': HofDrop,
};

const ACCENT: Record<OverlayStep, string> = {
  'drop-boss': '#A05CFF',
  'drop-final': '#FF8A3D',
  'drop-hof': '#FFD23F',
  'finish-holo': '#4FE3D1',
  'finish-fullart': '#FFD23F',
  'finish-arena': '#FF4FB0',
};
/** Apparition du bouton du bas, selon la maquette. */
const CTA_DELAY: Record<OverlayStep, string> = {
  'drop-boss': '1.4s',
  'drop-final': '3.1s',
  'drop-hof': '4.2s',
  'finish-holo': '1.5s',
  'finish-fullart': '2.8s',
  'finish-arena': '1.9s',
};

/** Étapes plein écran d'une carte qui ont une scène. */
export function revealChainOf(card: CardData, steps?: readonly RevealStep[]): OverlayStep[] {
  return overlaySteps(steps ?? getRevealAnimation(card.rarity, card.finish)).filter(
    (s) => SCENES[s],
  );
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
  const { phase, final, skip } = useStepSequence({
    durationMs: REVEAL_STEP_MS[step],
    skipLockMs: step === 'drop-hof' && props.firstHof ? FIRST_HOF_SKIP_LOCK_MS : 0,
    reduced: props.reduced,
    cues: CUES[step],
    onCue: props.onCue,
    onDone: (how) => {
      if (step === 'drop-hof') props.onHofSeen?.();
      // Fin naturelle d'une étape intermédiaire : on enchaîne la suivante.
      if (how === 'done' && !last) onDone();
    },
  });
  useEffect(() => onControl({ final, skip }), [final, skip, onControl]);
  const Scene = SCENES[step]!;
  const scale = useStageScale();
  return (
    <div
      className={`dp-stage${props.reduced ? ' dp-reduced' : ''}`}
      // Saut ou mode réduit seulement : à la fin naturelle, les boucles continuent d'elles-mêmes.
      data-final={phase === 'skipped' || undefined}
      data-testid="drop-stage"
      data-step={step}
      data-state={final ? 'final' : 'playing'}
      style={{ ['--dp-scale' as string]: scale } as CSSProperties}
    >
      <Scene card={props.card} chance={props.chance} ticker={props.ticker} afterDrop={index > 0} />
      {last && (
        <div
          className={`dp-actions${props.mode === 'opening' ? ' dp-cta' : ''}`}
          style={{ ['--cta-delay' as string]: CTA_DELAY[step] } as CSSProperties}
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
