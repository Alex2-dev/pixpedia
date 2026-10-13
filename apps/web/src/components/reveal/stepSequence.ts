/**
 * Logique pure d'une séquence de drop : en cours → sautée ou terminée.
 * Le hook useStepSequence branche cette logique sur des minuteries.
 */
export type StepPhase = 'playing' | 'skipped' | 'done';

export interface StepOptions {
  durationMs: number;
  /** Délai pendant lequel le saut est bloqué (1,5 s au premier Hall of Fame, sinon 0). */
  skipLockMs: number;
  /** Animations réduites : on part directement de l'état final (fondu de 0,3 s). */
  reduced: boolean;
}

export interface StepState {
  phase: StepPhase;
  startedAt: number;
}

/** Durée maximum pendant laquelle le saut d'un premier Hall of Fame est bloqué. */
export const FIRST_HOF_SKIP_LOCK_MS = 1500;
/** Fondu vers l'état final en mode réduit. */
export const REDUCED_FADE_MS = 300;

export function startSequence(opts: StepOptions, now: number): StepState {
  return { phase: opts.reduced ? 'skipped' : 'playing', startedAt: now };
}

export function canSkip(state: StepState, opts: StepOptions, now: number): boolean {
  return state.phase === 'playing' && now - state.startedAt >= opts.skipLockMs;
}

/** Un toucher pendant l'animation la saute à l'état final, sauf pendant le blocage. */
export function skip(state: StepState, opts: StepOptions, now: number): StepState {
  return canSkip(state, opts, now) ? { ...state, phase: 'skipped' } : state;
}

/** Fin naturelle de l'animation. */
export function tick(state: StepState, opts: StepOptions, now: number): StepState {
  return state.phase === 'playing' && now - state.startedAt >= opts.durationMs
    ? { ...state, phase: 'done' }
    : state;
}

export const isFinal = (phase: StepPhase) => phase !== 'playing';
