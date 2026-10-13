import { useEffect, useState } from 'react';

/** Largeur de carte qui tient `perRow` cartes sur un écran étroit, plafonnée à `max`. */
export function useCardWidth(max: number, perRow = 2, gutter = 16, gap = 12): number {
  const compute = () =>
    Math.floor(Math.min(max, (window.innerWidth - gutter * 2 - gap * (perRow - 1)) / perRow));
  const [width, setWidth] = useState(compute);
  useEffect(() => {
    const onResize = () => setWidth(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [max, perRow, gutter, gap]);
  return width;
}
