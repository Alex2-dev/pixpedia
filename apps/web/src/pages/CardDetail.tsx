import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  DEFAULT_PACK_ODDS,
  formatChance,
  dropOf,
  getRevealAnimation,
  normalizeFinish,
  perCardChance,
  recycleValue,
  type SlotOdds,
} from '@pixpedia/shared';
import { api, errorMessage, type CardDetail as Detail, type PacksResponse } from '../api';
import { toCardData } from '../card/adapt';
import { Card } from '../card/Card';
import { RevealOverlay } from '../components/reveal/RevealOverlay';
import { useSession } from '../session';
import { useCardWidth } from '../useCardWidth';
import { useReducedMotionPref } from '../useReducedMotion';

const FINISH_LABEL: Record<string, string> = {
  normal: 'Normale',
  holo: 'Holo',
  fullart: 'Full art',
  full_art: 'Full art',
  arena: 'Édition Arène',
};

export function CardDetail() {
  const { id } = useParams();
  const width = useCardWidth(300, 1);
  const [card, setCard] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [version, setVersion] = useState(0);
  const [dropOpen, setDropOpen] = useState(false);
  const [odds, setOdds] = useState<SlotOdds[]>(DEFAULT_PACK_ODDS);
  const reduced = useReducedMotionPref();

  // Chances affichées dans le drop : celles du pack standard.
  useEffect(() => {
    api<PacksResponse>('/packs').then(
      (r) => {
        const standard = r.packs.find((p) => p.code === 'standard');
        if (standard) setOdds(standard.odds);
      },
      () => {},
    );
  }, []);
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
        <Link to="/codex" className="btn">
          Retour au codex
        </Link>
      </section>
    );
  }
  if (!card) return <p className="muted center">Chargement…</p>;

  const best =
    card.owned.find((o) => normalizeFinish(o.finish) === 'fullart') ??
    card.owned.find((o) => o.finish === 'holo');
  const cardData = toCardData({ ...card, finish: best?.finish });
  const hasDrop = dropOf(getRevealAnimation(card.rarity)) !== null;
  // Date du premier exemplaire, toutes finitions confondues.
  const firstDrawn = card.owned.length
    ? new Date(Math.min(...card.owned.map((o) => new Date(o.firstObtainedAt).getTime())))
    : null;

  return (
    <article className="detail">
      <div className="detail-card">
        <Card data={cardData} width={width} />
        <p className="muted small center">Touchez la carte pour la retourner</p>
        {firstDrawn && (
          <p className="px-label center drawn-on" data-testid="drawn-on">
            Tirée le {firstDrawn.toLocaleDateString('fr-FR')}
          </p>
        )}
        {/* Disponible pour tous, même sans posséder la carte : ça donne envie de la tirer. */}
        {hasDrop && (
          <button
            type="button"
            className="btn"
            data-testid="play-drop"
            onClick={() => setDropOpen(true)}
          >
            ▶ Voir l'animation de drop
          </button>
        )}
      </div>
      {dropOpen && (
        <RevealOverlay
          card={{ ...cardData, isNew: false }}
          steps={getRevealAnimation(card.rarity)}
          chance={formatChance(perCardChance(card.rarity, odds))}
          mode="catalogue"
          reduced={reduced}
          onClose={() => setDropOpen(false)}
        />
      )}
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
            <span className="px-label muted">Dans ton codex</span>
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
