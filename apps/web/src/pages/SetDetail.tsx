import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SET_TYPES } from '@pixpedia/shared';
import { api, errorMessage, type SetDetail as Detail } from '../api';
import { toCardData } from '../card/adapt';
import { Card } from '../card/Card';
import { Silhouette } from '../card/Silhouette';
import { Progress } from '../components/Progress';
import { useCardWidth } from '../useCardWidth';

const PAGE_SIZE = 40;
type Show = 'all' | 'owned' | 'missing';

export function SetDetail() {
  const { type, key } = useParams();
  const navigate = useNavigate();
  const width = useCardWidth(160, 2);
  const [show, setShow] = useState<Show>('all');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [cards, setCards] = useState<Detail['cards']>([]);
  const [error, setError] = useState<string | null>(null);

  const query = `/sets/${type}/${encodeURIComponent(key ?? '')}?missing=${show}&page=${page}&pageSize=${PAGE_SIZE}`;
  useEffect(() => {
    let cancelled = false;
    api<Detail>(query).then(
      (r) => {
        if (cancelled) return;
        setDetail(r);
        setCards((prev) => (r.page === 1 ? r.cards : [...prev, ...r.cards]));
      },
      (err) => !cancelled && setError(errorMessage(err)),
    );
    return () => {
      cancelled = true;
    };
  }, [query]);

  if (error) {
    return (
      <section className="panel center">
        <p className="error">Set introuvable.</p>
        <Link to="/sets" className="btn">
          Retour aux sets
        </Link>
      </section>
    );
  }
  if (!detail) return <p className="muted center">Chargement…</p>;

  const typeLabel = SET_TYPES.find((t) => t.type === detail.type)?.label ?? '';
  const choose = (s: Show) => {
    setPage(1);
    setShow(s);
  };

  return (
    <section className="set-detail">
      <p className="px-label muted">
        <Link to={`/sets?type=${detail.type}`}>{typeLabel}</Link>
      </p>
      <h1>{detail.name}</h1>
      <Progress owned={detail.owned} total={detail.total} label="Progression du set" />

      <div className="segmented" role="group" aria-label="Cartes affichées">
        {(
          [
            ['all', 'Toutes'],
            ['owned', 'Possédées'],
            ['missing', 'Manquantes'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={show === value}
            onClick={() => choose(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="card-grid" style={{ ['--card-w' as string]: `${width}px` }}>
        {cards.map((c) => (
          <li key={c.cardId} className="card-cell">
            {c.owned ? (
              <Card
                data={toCardData(c)}
                width={width}
                onActivate={() => navigate(`/carte/${c.cardId}`)}
              />
            ) : (
              <Silhouette card={c} width={width} />
            )}
          </li>
        ))}
      </ul>
      {cards.length === 0 && (
        <p className="muted center">
          {show === 'owned' ? 'Aucune carte de ce set pour l’instant.' : 'Set complet, bravo !'}
        </p>
      )}

      {cards.length < detail.matching && (
        <div className="center">
          <button type="button" className="btn btn-ghost" onClick={() => setPage((p) => p + 1)}>
            Afficher plus
          </button>
        </div>
      )}
    </section>
  );
}
