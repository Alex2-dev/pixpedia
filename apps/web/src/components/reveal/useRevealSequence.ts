import { useCallback, useState } from 'react';
import { nextInChain, startChain, isLastInChain, type OverlayStep } from '@pixpedia/shared';

/**
 * Enchaîne les étapes plein écran d'une révélation (drop puis finition). Chaque étape est
 * pilotée par useStepSequence ; ce hook ne fait que passer de l'une à l'autre.
 */
export function useRevealSequence(steps: readonly OverlayStep[], reduced: boolean) {
  const [chain, setChain] = useState(() => startChain(steps, reduced));
  // Chaque relance (« Rejouer ») remonte les scènes depuis la première étape.
  const [run, setRun] = useState(0);

  /** Passe à l'étape suivante ; renvoie false s'il n'y en a plus. */
  const next = useCallback(() => {
    const following = nextInChain(chain);
    if (following) setChain(following);
    return following !== null;
  }, [chain]);

  const replay = useCallback(() => {
    setChain(startChain(steps, reduced));
    setRun((r) => r + 1);
  }, [steps, reduced]);

  return {
    step: chain.steps[chain.index],
    index: chain.index,
    last: isLastInChain(chain),
    /** Clé React de l'étape en cours : change à chaque étape et à chaque relance. */
    key: `${run}-${chain.index}`,
    next,
    replay,
  };
}
