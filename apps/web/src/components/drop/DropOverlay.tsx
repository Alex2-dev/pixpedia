import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { getRevealAnimation, type DropKind } from '@pixpedia/shared';
import type { CardData } from '../../card/types';
import { FIRST_HOF_SKIP_LOCK_MS } from './dropSequence';
import { BossDrop } from './drops/BossDrop';
import { FinalDrop } from './drops/FinalDrop';
import { HofDrop } from './drops/HofDrop';
import type { DropSceneProps } from './drops/shared';
import { useDropSequence, type CueAt, type DropCue } from './useDropSequence';
import { useStageScale } from './useStageScale';
import './drop.css';

/** Signaux sonores de chaque drop, aux moments clés des timelines de la maquette (ms). */
const CUES: Record<DropKind, readonly CueAt[]> = {
  boss: [
    { at: 0, cue: 'rumble' },
    { at: 720, cue: 'impact' },
  ],
  final: [
    { at: 100, cue: 'rumble' },
    { at: 650, cue: 'crack' },
    { at: 1250, cue: 'explode' },
    { at: 1800, cue: 'slam' },
    { at: 2150, cue: 'crown' },
    { at: 2350, cue: 'title' },
  ],
  hof: [
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

const SCENES: Record<DropKind, (p: DropSceneProps) => ReactNode> = {
  boss: BossDrop,
  final: FinalDrop,
  hof: HofDrop,
};

const ACCENT: Record<DropKind, string> = { boss: '#A05CFF', final: '#FF8A3D', hof: '#FFD23F' };
/** Apparition du bouton du bas, selon la maquette. */
const CTA_DELAY: Record<DropKind, string> = { boss: '1.4s', final: '3.1s', hof: '4.2s' };

export interface DropOverlayProps {
  card: CardData;
  chance: DropSceneProps['chance'];
  /** « opening » : bouton « Ajouter au codex ». « catalogue » : « Rejouer » et « Fermer ». */
  mode: 'opening' | 'catalogue';
  /** prefers-reduced-motion ou option « Animations réduites » du profil. */
  reduced: boolean;
  /** Premier Hall of Fame du joueur : saut bloqué 1,5 s. */
  firstHof?: boolean;
  ticker?: string;
  onClose: () => void;
  onCue?: (cue: DropCue) => void;
  /** Appelé quand l'animation d'un Hall of Fame a été vue jusqu'à son état final. */
  onHofSeen?: () => void;
}

function DropRun({
  kind,
  props,
  onFinal,
  onReplay,
}: {
  kind: DropKind;
  props: DropOverlayProps;
  onFinal: (final: boolean, skip: () => void) => void;
  onReplay: () => void;
}) {
  const { durationMs } = getRevealAnimation(props.card.rarity);
  const { phase, final, skip } = useDropSequence({
    durationMs,
    skipLockMs: kind === 'hof' && props.firstHof ? FIRST_HOF_SKIP_LOCK_MS : 0,
    reduced: props.reduced,
    cues: CUES[kind],
    onCue: props.onCue,
    onDone: () => {
      if (kind === 'hof') props.onHofSeen?.();
    },
  });
  useEffect(() => onFinal(final, skip), [final, skip, onFinal]);
  const Scene = SCENES[kind];
  const scale = useStageScale();
  return (
    <div
      className={`dp-stage${props.reduced ? ' dp-reduced' : ''}`}
      // Saut ou mode réduit seulement : à la fin naturelle, les boucles continuent d'elles-mêmes.
      data-final={phase === 'skipped' || undefined}
      data-testid="drop-stage"
      data-state={final ? 'final' : 'playing'}
      style={{ ['--dp-scale' as string]: scale } as CSSProperties}
    >
      <Scene card={props.card} chance={props.chance} ticker={props.ticker} />
      <div
        className={`dp-actions${props.mode === 'opening' ? ' dp-cta' : ''}`}
        style={{ ['--cta-delay' as string]: CTA_DELAY[kind] } as CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        {props.mode === 'opening' ? (
          <button
            type="button"
            className="dp-btn"
            style={{ background: ACCENT[kind] }}
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
              style={{ background: ACCENT[kind] }}
              onClick={props.onClose}
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Animation de drop plein écran (Boss, Boss final, Hall of Fame).
 * Un toucher la saute à l'état final ; ensuite, en mode ouverture, un toucher referme.
 */
export function DropOverlay(props: DropOverlayProps) {
  const reveal = getRevealAnimation(props.card.rarity);
  const kind = reveal.kind === 'drop' ? reveal.drop : null;
  const [run, setRun] = useState(0);
  const state = useRef<{ final: boolean; skip: () => void }>({ final: false, skip: () => {} });
  const rootRef = useRef<HTMLDivElement>(null);
  const onFinal = useCallback((final: boolean, skip: () => void) => {
    state.current = { final, skip };
  }, []);

  useEffect(() => {
    rootRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (!kind) return null;

  const activate = () => {
    if (!state.current.final) state.current.skip();
    else if (props.mode === 'opening') props.onClose();
  };

  return (
    <div
      ref={rootRef}
      className="dp-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Animation de drop : ${props.card.name}`}
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
      <DropRun
        key={run}
        kind={kind}
        props={props}
        onFinal={onFinal}
        onReplay={() => setRun((r) => r + 1)}
      />
    </div>
  );
}
