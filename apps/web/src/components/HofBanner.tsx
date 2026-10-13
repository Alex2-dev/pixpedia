import { Link } from 'react-router-dom';
import { Px } from '../card/pixel';

export interface HofDrop {
  id: number;
  username: string;
  cardId: number;
  name: string;
  createdAt: string;
}

/**
 * Bandeau « pseudo a tiré Nom du jeu » (événement card_drop_hof). Un clic ouvre la fiche,
 * avec l'animation rejouable. Les annonces viennent de GET /drops/hof ; le temps réel
 * (SSE ou WebSocket) les poussera plus tard chez tous les joueurs connectés.
 */
export function HofBanner({ drop, onDismiss }: { drop: HofDrop; onDismiss: () => void }) {
  return (
    <div className="hof-banner" role="status" data-testid="hof-banner">
      <Link to={`/carte/${drop.cardId}`} className="hof-banner__link" onClick={onDismiss}>
        <Px name="trophy" color="#120E1A" scale={2} />
        <span>
          <b>{drop.username}</b> a tiré <b>{drop.name}</b>
        </span>
      </Link>
      <button
        type="button"
        className="hof-banner__close"
        aria-label="Fermer l'annonce"
        onClick={onDismiss}
      >
        ✕
      </button>
    </div>
  );
}
