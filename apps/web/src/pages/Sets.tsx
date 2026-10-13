import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SET_TYPES, type SetType } from '@pixpedia/shared';
import { api, errorMessage, type SetEntry, type SetsPage, type SetsSummary } from '../api';
import { Progress } from '../components/Progress';

const PAGE_SIZE = 50;
type Sort = 'progress' | 'size' | 'name';

export function Sets() {
  const [params, setParams] = useSearchParams();
  const type = (SET_TYPES.find((t) => t.type === params.get('type'))?.type ??
    'platform') as SetType;
  const [sort, setSort] = useState<Sort>('progress');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [summary, setSummary] = useState<SetsSummary['types']>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<SetsSummary>('/sets/summary').then(
      (r) => setSummary(r.types),
      () => setSummary([]),
    );
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const query = new URLSearchParams({
    type,
    sort,
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });
  if (debounced) query.set('search', debounced);
  const queryString = query.toString();

  useEffect(() => {
    let cancelled = false;
    api<SetsPage>(`/sets?${queryString}`).then(
      (r) => {
        if (cancelled) return;
        setSets((prev) => (r.page === 1 ? r.sets : [...prev, ...r.sets]));
        setTotal(r.total);
        setError(null);
      },
      (err) => !cancelled && setError(errorMessage(err)),
    );
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  const reset = () => setPage(1);

  return (
    <section className="sets">
      <h1>Sets</h1>
      <p className="muted">
        Complète ta collection par plateforme, époque, genre, studio ou franchise. Une même carte
        compte dans tous ses sets.
      </p>

      <nav className="tabs" aria-label="Types de sets">
        {SET_TYPES.map((t) => {
          const s = summary.find((x) => x.type === t.type);
          return (
            <button
              key={t.type}
              type="button"
              className={t.type === type ? 'is-active' : ''}
              aria-pressed={t.type === type}
              onClick={() => {
                reset();
                setSearch('');
                setParams({ type: t.type });
              }}
            >
              {t.label}
              {s && s.started > 0 && <span className="tab-count">{s.started}</span>}
            </button>
          );
        })}
      </nav>

      <div className="filters filters-2">
        <input
          type="search"
          placeholder="Rechercher un set"
          aria-label="Rechercher un set"
          value={search}
          onChange={(e) => {
            reset();
            setSearch(e.target.value);
          }}
        />
        <select
          aria-label="Tri"
          value={sort}
          onChange={(e) => {
            reset();
            setSort(e.target.value as Sort);
          }}
        >
          <option value="progress">Les plus avancés</option>
          <option value="size">Les plus grands</option>
          <option value="name">Nom</option>
        </select>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {total === 0 && <p className="muted">Aucun set ne correspond.</p>}

      <ul className="set-list">
        {sets.map((s) => (
          <li key={s.key}>
            <Link to={`/sets/${s.type}/${encodeURIComponent(s.key)}`} className="set-row">
              <span className="set-name">{s.name}</span>
              <Progress owned={s.owned} total={s.total} label={`Progression du set ${s.name}`} />
            </Link>
          </li>
        ))}
      </ul>

      {total !== null && sets.length < total && (
        <div className="center">
          <button type="button" className="btn btn-ghost" onClick={() => setPage((p) => p + 1)}>
            Afficher plus
          </button>
        </div>
      )}
    </section>
  );
}
