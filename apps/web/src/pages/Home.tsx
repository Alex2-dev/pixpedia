import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RARITIES, RARITY_KEYS } from '@pixpedia/shared';
import { api, type PackType } from '../api';
import { CardBack } from '../card/fronts';
import { useSession } from '../session';
import { formatCountdown } from '../time';

function Landing() {
  return (
    <section className="panel landing" aria-labelledby="title">
      <p className="px-label">Alex² présente</p>
      <h1 id="title">Pixpedia</h1>
      <p className="tagline">Collectionne tous les jeux vidéo jamais sortis.</p>
      <p className="muted">
        Ouvre des packs, découvre des jeux de toutes les époques et complète ta collection. Chaque
        carte est un vrai jeu vidéo.
      </p>
      <div className="actions">
        <Link to="/inscription" className="btn">
          Créer un compte
        </Link>
        <Link to="/connexion" className="btn btn-ghost">
          Se connecter
        </Link>
      </div>
    </section>
  );
}

function Countdown({ target, onDone }: { target: string; onDone: () => void }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = formatCountdown(new Date(target), now);
  useEffect(() => {
    if (left === null) onDone();
  }, [left, onDone]);
  return <span className="px-label">{left ?? '0:00'}</span>;
}

/** Taux de drop publiés (spec §5.4). */
function DropRates({ pack }: { pack: PackType }) {
  return (
    <details className="panel rates">
      <summary>Taux de drop du {pack.name.toLowerCase()}</summary>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Carte</th>
              {[...RARITY_KEYS].reverse().map((r) => (
                <th key={r}>{RARITIES[r].label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pack.odds.map((slot, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                {[...RARITY_KEYS].reverse().map((r) => (
                  <td key={r}>{slot[r] ? `${slot[r]} %` : '·'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small">
        Après 10 packs sans Boss ou mieux, la 5e carte du pack suivant est au moins Boss. Finitions
        indépendantes : holo 1 sur 20, full art 1 sur 200.
      </p>
    </details>
  );
}

function PackHome() {
  const { me, refresh } = useSession();
  const navigate = useNavigate();
  const [packs, setPacks] = useState<PackType[]>([]);
  useEffect(() => {
    api<{ packs: PackType[] }>('/packs').then(
      (r) => setPacks(r.packs),
      () => setPacks([]),
    );
  }, []);
  if (!me) return null;
  const standard = packs.find((p) => p.code === 'standard');
  const canOpen = me.packsAvailable > 0 && standard;

  return (
    <section className="pack-home">
      <button
        type="button"
        className="pack-stack"
        disabled={!canOpen}
        onClick={() => navigate('/ouverture', { state: { packTypeId: standard!.id } })}
        aria-label="Ouvrir un pack standard"
      >
        <span className="pack-card pack-card-3">
          <CardBack data={{}} />
        </span>
        <span className="pack-card pack-card-2">
          <CardBack data={{}} />
        </span>
        <span className="pack-card pack-card-1">
          <CardBack data={{}} />
        </span>
      </button>
      <div className="pack-info">
        <p className="px-label">Pack standard · 5 cartes</p>
        <p className="stock">
          <strong>{me.packsAvailable}</strong> / {me.packsMax} packs
        </p>
        <p className="muted small">
          {me.nextPackAt ? (
            <>
              Prochain pack dans <Countdown target={me.nextPackAt} onDone={refresh} />
            </>
          ) : (
            'Stock plein'
          )}
        </p>
        <button
          type="button"
          className="btn"
          disabled={!canOpen}
          onClick={() => navigate('/ouverture', { state: { packTypeId: standard!.id } })}
        >
          Ouvrir un pack
        </button>
      </div>
      {standard && <DropRates pack={standard} />}
    </section>
  );
}

export function Home() {
  const { me } = useSession();
  if (me === undefined) return <p className="muted center">Chargement…</p>;
  return me ? <PackHome /> : <Landing />;
}
