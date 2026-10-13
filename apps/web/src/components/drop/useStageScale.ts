import { useEffect, useState } from 'react';

/** Taille de la scène de la maquette (téléphone 390 × 844). */
export const STAGE_W = 390;
export const STAGE_H = 844;

const compute = () =>
  typeof window === 'undefined'
    ? 1
    : Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);

/**
 * Facteur d'échelle pour que la scène tienne dans l'écran : les positions de la maquette
 * (en px dans 390 × 844) restent exactes, sur téléphone comme sur ordinateur.
 */
export function useStageScale(): number {
  const [scale, setScale] = useState(compute);
  useEffect(() => {
    const onResize = () => setScale(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return scale;
}
