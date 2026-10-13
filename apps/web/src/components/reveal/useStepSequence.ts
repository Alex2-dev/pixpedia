import { useCallback, useEffect, useRef, useState } from 'react';
import {
  REDUCED_FADE_MS,
  isFinal,
  skip as skipState,
  startSequence,
  tick,
  type StepPhase,
  type StepOptions,
} from './stepSequence';

/** Moments clés où l'on jouera les sons 8-bit (aucun fichier audio pour l'instant). */
export type RevealCue =
  | 'rumble'
  | 'crack'
  | 'impact'
  | 'explode'
  | 'slam'
  | 'crown'
  | 'title'
  | 'fanfare'
  | 'firework'
  | 'trophy';

export interface CueAt {
  /** En millisecondes depuis le début du drop. */
  at: number;
  cue: RevealCue;
}

export interface UseStepSequence extends StepOptions {
  cues?: readonly CueAt[];
  onCue?: (cue: RevealCue) => void;
  /** Appelé une fois, quand l'état final est atteint (fin naturelle, saut ou mode réduit). */
  onDone?: (phase: Exclude<StepPhase, 'playing'>) => void;
}

/**
 * Pilote une animation de drop : en cours → sautée ou terminée.
 * Les minuteries sont toutes annulées au démontage et dès que l'état final est atteint.
 */
export function useStepSequence(opts: UseStepSequence) {
  const { durationMs, skipLockMs, reduced, cues, onCue, onDone } = opts;
  const options = { durationMs, skipLockMs, reduced };
  const [state, setState] = useState(() => startSequence(options, Date.now()));
  const callbacks = useRef({ onCue, onDone });
  useEffect(() => {
    callbacks.current = { onCue, onDone };
  });

  // Fin naturelle et signaux sonores, tant que l'animation joue.
  useEffect(() => {
    if (state.phase !== 'playing') return;
    const timers = [
      setTimeout(
        () => setState((s) => tick(s, { durationMs, skipLockMs, reduced }, Date.now())),
        durationMs,
      ),
      ...(cues ?? []).map(({ at, cue }) => setTimeout(() => callbacks.current.onCue?.(cue), at)),
    ];
    return () => timers.forEach(clearTimeout);
  }, [state.phase, durationMs, skipLockMs, reduced, cues]);

  // Signale l'état final une seule fois (après le fondu de 0,3 s en mode réduit).
  const notified = useRef(false);
  useEffect(() => {
    if (!isFinal(state.phase)) return;
    const phase = state.phase as Exclude<StepPhase, 'playing'>;
    const fire = () => {
      if (notified.current) return;
      notified.current = true;
      callbacks.current.onDone?.(phase);
    };
    if (reduced) {
      const t = setTimeout(fire, REDUCED_FADE_MS);
      return () => clearTimeout(t);
    }
    fire();
  }, [state.phase, reduced]);

  const skip = useCallback(
    () => setState((s) => skipState(s, { durationMs, skipLockMs, reduced }, Date.now())),
    [durationMs, skipLockMs, reduced],
  );

  return { phase: state.phase, final: isFinal(state.phase), skip };
}
