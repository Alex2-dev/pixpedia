import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { recycleValue } from '@pixpedia/shared';
import { api, errorMessage, type CardDetail as Detail } from '../api';
import { toCardData } from '../card/adapt';
import { Card } from '../card/Card';
import { useSession } from '../session';
import { useCardWidth } from '../useCardWidth';

const FINISH_LABEL: Record<string, string> = {
  normal: 'Normale',
  holo: 'Holo',
  full_art: 'Full art',
};

export function CardDetail() {
  const { id } = useParams();
  const width = useCardWidth(300, 1);
  const [card, setCard] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [version, setVersion] = useState(0);
  const { refresh } = useSession();

  useEffect(() => {
    let cancelled = false;
    api<Detail>(`/cards/${id}`).then(
      (c) => !cancelled && setCard(c),
      (err) => !cancelled && setError(errorMessage(err)),
    );
    return () => {
      cancelled = true;
    };
  }, [id, version]);

  const recycleCopies = async (finish: string, quantity: number) => {
    await api('/cards/recycle', { method: 'POST', body: { cardId: Number(id), finish, quantity } });
    await refresh();
    setVersion((v) => v + 1);
  };

  if (error) {
    return (
      <section className="panel center">
        <p className="error">Carte introuvable.</p>
        <Link to="/classeur" className="btn">
          Retour au classeur
        </Link>
      </section>
    );
  }
  if (!card) return <p className="muted center">Chargement…</p>;

  const best =
    card.owned.find((o) => o.finish === 'full_art') ?? card.owned.find((o) => o.finish === 'holo');

  return (
    <article className="detail">
      <div className="detail-card">
        <Card data={toCardData({ ...card, finish: best?.finish })} width={width} />
        <p className="muted small center">Touchez la carte pour la retourner</p>
      </div>
      <div className="panel detail-info">
        <p className="px-label muted">
          {card.number} · Série {card.seriesCode} · {card.rarityLabel} · {card.familyLabel}
        </p>
        <h1>{card.name}</h1>
        <p className="muted">{[card.year, card.developer].filter(Boolean).join(' · ')}</p>
        {card.summary && <p className="summary">{card.summary}</p>}
        {card.platforms.length > 0 && (
          <p className="small">
            <span className="px-label muted">Plateformes</span>
            <br />
            {card.platforms.join(', ')}
          </p>
        )}
        <dl className="stats-list">
          <div>
            <dt>ATK</dt>
            <dd>{card.atk}</dd>
          </div>
          <div>
            <dt>DEF</dt>
            <dd>{card.def}</dd>
          </div>
          <div>
            <dt>PV</dt>
            <dd>{card.hp}</dd>
          </div>
          <div>
            <dt>VIT</dt>
            <dd>{card.spd}</dd>
          </div>
        </dl>
        {card.owned.length > 0 ? (
          <div className="small">
            <span className="px-label muted">Dans ton classeur</span>
            <ul className="owned">
              {card.owned.map((o) => (
                <li key={`${o.finish}-${o.isBound}`}>
                  {FINISH_LABEL[o.finish] ?? o.finish} ×{o.quantity}
                  {o.isBound ? ' · liée au compte' : ''} · depuis le{' '}
                  {new Date(o.firstObtainedAt).toLocaleDateString('fr-FR')}
                  {!o.isBound && o.quantity > 1 && (
                    <button
                      type="button"
                      className="btn-link recycle"
                      onClick={() => void recycleCopies(o.finish, o.quantity - 1)}
                    >
                      Recycler {o.quantity - 1} doublon{o.quantity > 2 ? 's' : ''} (+
                      {recycleValue(card.rarity, o.quantity - 1)} éclats)
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="muted small">Tu ne possèdes pas encore cette carte.</p>
        )}
        <p className="small">
          Données et fiche du jeu :{' '}
          <a href={card.igdbUrl} target="_blank" rel="noreferrer">
            IGDB.com
          </a>
        </p>
      </div>
    </article>
  );
}
