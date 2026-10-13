import { useEffect, useState } from 'react';
import { useSession } from './session';

const QUERY = '(prefers-reduced-motion: reduce)';

/** Animations réduites : réglage du système (prefers-reduced-motion) ou option du profil. */
export function useReducedMotionPref(): boolean {
  const { me } = useSession();
  const [system, setSystem] = useState(() => window.matchMedia(QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setSystem(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return system || Boolean(me?.reducedMotion);
}
