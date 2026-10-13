import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FAMILY_KEYS,
  FAMILY_LABELS,
  RARITIES,
  RARITY_KEYS,
  type Family,
  type Rarity,
} from '@pixpedia/shared';
import {
  api,
  errorMessage,
  type RecycleResult,
  type CollectionFilters,
  type CollectionPage,
  type OwnedCard,
} from '../api';
import { toCardData } from '../card/adapt';
import { Card } from '../card/Card';
import { useSession } from '../session';
import { useCardWidth } from '../useCardWidth';

const PAGE_SIZE = 40;

/** Bandeau de recyclage : tous les doublons libres en éclats, en un clic (spec §5.6). */
function Duplicates({ onRecycled }: { onRecycled: () => void }) {
  const { refresh } = useSession();
  const [info, setInfo] = useState<{ copies: number; shards: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    api<{ copies: number; shards: number }>('/collection/duplicates').then(setInfo, () =>
      setInfo(null),
    );
  }, [version]);

  if (!info || (info.copies === 0 && !message)) return null;
  const recycleAll = async () => {
    setPending(true);
    try {
      const r = await api<RecycleResult>('/cards/recycle-duplicates', { method: 'POST' });
      setMessage(`${r.copies} doublons recyclés : +${r.shardsGained} éclats.`);
      await refresh();
      onRecycled();
      setVersion((v) => v + 1);
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="panel duplicates" aria-live="polite">
      {info.copies > 0 ? (
        <>
          <p>
            <strong>{info.copies}</strong> doublon{info.copies > 1 ? 's' : ''} recyclable
            {info.copies > 1 ? 's' : ''} contre <strong>{info.shards}</strong> éclats. Un exemplaire
            de chaque carte est toujours gardé.
          </p>
          <button type="button" className="btn btn-small" disabled={pending} onClick={recycleAll}>
            Recycler les doublons
          </button>
        </>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
}

function query(filters: CollectionFilters, page: number): string {
  const p = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    sort: filters.sort,
  });
  if (filters.rarity) p.set('rarity', filters.rarity);
  if (filters.family) p.set('family', filters.family);
  if (filters.search) p.set('search', filters.search);
  return p.toString();
}

export function Collection() {
  const navigate = useNavigate();
  const width = useCardWidth(180, 2);
  const [filters, setFilters] = useState<CollectionFilters>({ sort: 'recent' });
  const [search, setSearch] = useState('');
  const [cards, setCards] = useState<OwnedCard[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  /** Requête dont le résultat est affiché : le chargement en découle, sans état en plus. */
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null);
  const currentQuery = query(filters, page);
  const loading = loadedQuery !== currentQuery;

  // La recherche part 300 ms après la dernière frappe.
  useEffect(() => {
    const t = setTimeout(
      () => setFilters((f) => ({ ...f, search: search.trim() || undefined })),
      300,
    );
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    api<CollectionPage>(`/collection?${currentQuery}`)
      .then((r) => {
        if (cancelled) return;
        setCards((prev) => (r.page === 1 ? r.cards : [...prev, ...r.cards]));
        setTotal(r.total);
        setError(null);
      })
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoadedQuery(currentQuery));
    return () => {
      cancelled = true;
    };
  }, [currentQuery]);

  const update = (patch: Partial<CollectionFilters>) => {
    setPage(1);
    setFilters((f) => ({ ...f, ...patch }));
  };

  return (
    <section className="collection">
      <header className="collection-head">
        <h1>Classeur</h1>
        {total !== null && <span className="px-label muted">{total} cartes</span>}
      </header>

      <Duplicates onRecycled={() => setFilters((f) => ({ ...f }))} />

      <div className="filters" role="search">
        <input
          type="search"
          placeholder="Rechercher un jeu"
          aria-label="Rechercher un jeu"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          aria-label="Rareté"
          value={filters.rarity ?? ''}
          onChange={(e) => update({ rarity: (e.target.value || undefined) as Rarity | undefined })}
        >
          <option value="">Toutes les raretés</option>
          {[...RARITY_KEYS].reverse().map((r) => (
            <option key={r} value={r}>
              {RARITIES[r].label}
            </option>
          ))}
        </select>
        <select
          aria-label="Famille"
          value={filters.family ?? ''}
          onChange={(e) => update({ family: (e.target.value || undefined) as Family | undefined })}
        >
          <option value="">Toutes les familles</option>
          {FAMILY_KEYS.map((f) => (
            <option key={f} value={f}>
              {FAMILY_LABELS[f]}
            </option>
          ))}
        </select>
        <select
          aria-label="Tri"
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value as CollectionFilters['sort'] })}
        >
          <option value="recent">Plus récentes</option>
          <option value="rarity">Rareté</option>
          <option value="name">Nom</option>
          <option value="year">Année de sortie</option>
        </select>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {total === 0 && !loading && (
        <div className="panel center">
          <p className="muted">
            {filters.rarity || filters.family || filters.search
              ? 'Aucune carte ne correspond à ces filtres.'
              : 'Ton classeur est vide pour l’instant.'}
          </p>
          <Link to="/" className="btn">
            Ouvrir un pack
          </Link>
        </div>
      )}

      <ul className="card-grid" style={{ ['--card-w' as string]: `${width}px` }}>
        {cards.map((c) => (
          <li key={`${c.cardId}-${c.finish}-${c.isBound}`} className="card-cell">
            <Card
              data={toCardData(c)}
              width={width}
              onActivate={() => navigate(`/carte/${c.cardId}`)}
            />
            {c.quantity > 1 && <span className="qty px-label">×{c.quantity}</span>}
          </li>
        ))}
      </ul>

      {total !== null && cards.length < total && (
        <div className="center">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={loading}
            onClick={() => setPage((p) => p + 1)}
          >
            {loading ? 'Chargement…' : 'Afficher plus'}
          </button>
        </div>
      )}
    </section>
  );
}
