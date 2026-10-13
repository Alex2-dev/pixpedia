import { Card } from '../../../card/Card';
import { CardBack } from '../../../card/fronts';
import type { CardData } from '../../../card/types';

export interface DropSceneProps {
  card: CardData;
  /** « 5,4 % » et 19 pour « 1 chance sur 19 ». */
  chance: { pct: string; oneIn: number | null };
  /** Texte du bandeau Hall of Fame (« thedead a tiré Starfall Odyssey »). */
  ticker?: string;
}

export const chanceLine = (c: DropSceneProps['chance']) =>
  c.oneIn ? `${c.pct} · 1 CHANCE SUR ${c.oneIn}` : c.pct;

/** Dos de carte à la taille du design (240 × 336), le composant existant. */
export function DropBack() {
  return (
    <div style={{ position: 'relative', width: 240, height: 336 }}>
      <CardBack data={{}} />
    </div>
  );
}

/** Recto, le composant carte existant, qui flotte doucement une fois posé. */
export function DropFront({ card }: { card: CardData }) {
  return (
    <div className="dp-float">
      <Card data={card} width={240} tilt={false} onActivate={() => {}} />
    </div>
  );
}
