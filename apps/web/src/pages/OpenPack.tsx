import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { rarityRank, type Rarity } from '@pixpedia/shared';
import { api, errorMessage, type OpenResult } from '../api';
import { toCardData } from '../card/adapt';
import { Card } from '../card/Card';
import { RARITY_STYLE } from '../card/types';
import { useSession } from '../session';
import { useCardWidth } from '../useCardWidth';

/** Les raretés Boss et au-dessus ont droit à un éclat à la révélation. */
const isBig = (r: Rarity) => rarityRank(r) >= rarityRank('boss');

/**
 * Ouverture d'un pack. Le tirage est décidé par le serveur ; l'animation ne fait que
 * rejouer le résultat (spec §8.4). La clé d'idempotence protège du double appel.
 */
export function OpenPack() {
  const location = useLocation();
  const navigate = useNavigate();
  const { me, setMe, refresh } = useSession();
  const reduce = useReducedMotion();
  const state = location.state as {
    packTypeId?: number;
    useShards?: boolean;
    paid?: boolean;
  } | null;
  const packTypeId = state?.packTypeId;
  const useShards = state?.useShards ?? false;
  const key = useRef(crypto.randomUUID());
  const [result, setResult] = useState<OpenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const width = useCardWidth(200, 2);

  useEffect(() => {
    if (!packTypeId) return;
    let cancelled = false;
    api<OpenResult>('/packs/open', {
      method: 'POST',
      body: { packTypeId, idempotencyKey: key.current, useShards },
    }).then(
      (r) => {
        if (cancelled) return;
        setResult(r);
        setRevealed(r.cards.map(() => false));
      },
      (err) => !cancelled && setError(errorMessage(err)),
    );
    return () => {
      cancelled = true;
    };
  }, [packTypeId, useShards]);

  // Met à jour le stock affiché dans l'en-tête dès que le tirage est connu.
  useEffect(() => {
    if (result && me) {
      setMe({
        ...me,
        packsAvailable: result.packsAvailable,
        nextPackAt: result.nextPackAt,
        pityCounter: result.pityCounter,
        shards: result.shards,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  if (!packTypeId) return <Navigate to="/" replace />;

  if (error) {
    return (
      <section className="panel center">
        <p className="error" role="alert">
          {error}
        </p>
        <Link to="/" className="btn">
          Retour aux packs
        </Link>
      </section>
    );
  }

  if (!result) {
    return (
      <div className="opening" aria-live="polite">
        <motion.div
          className="pack-shake"
          animate={reduce ? undefined : { rotate: [0, -3, 3, -2, 2, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <span className="px-label">Ouverture du pack…</span>
        </motion.div>
      </div>
    );
  }

  const reveal = (i: number) => setRevealed((r) => r.map((v, j) => (j === i ? true : v)));
  const nextHidden = revealed.indexOf(false);
  const allRevealed = nextHidden === -1;
  const newCount = result.cards.filter((c) => c.isNew).length;

  return (
    <section className="opening">
      <div className="reveal-grid" style={{ ['--card-w' as string]: `${width}px` }}>
        {result.cards.map((c, i) => {
          const shown = revealed[i]!;
          const big = shown && isBig(c.rarity);
          return (
            <motion.div
              key={c.cardId}
              className="reveal-slot"
              initial={reduce ? false : { opacity: 0, y: 40, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{
                delay: reduce ? 0 : i * 0.12,
                type: 'spring',
                stiffness: 260,
                damping: 22,
              }}
            >
              {big && !reduce && (
                <motion.span
                  className="burst"
                  style={{ ['--burst' as string]: RARITY_STYLE[c.rarity].color }}
                  initial={{ opacity: 0.9, scale: 0.6 }}
                  animate={{ opacity: 0, scale: 1.6 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  aria-hidden="true"
                />
              )}
              <Card
                data={toCardData(c)}
                width={width}
                flipped={!shown}
                tilt={shown}
                onActivate={() => (shown ? navigate(`/carte/${c.cardId}`) : reveal(i))}
              />
              {shown && (
                <span
                  className="px-label reveal-label"
                  style={{ color: RARITY_STYLE[c.rarity].color }}
                >
                  {RARITY_STYLE[c.rarity].label}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="reveal-actions" aria-live="polite">
        {!allRevealed ? (
          <>
            <button type="button" className="btn" onClick={() => reveal(nextHidden)}>
              Révéler la suivante
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setRevealed((r) => r.map(() => true))}
            >
              Tout révéler
            </button>
          </>
        ) : (
          <>
            <p className="muted">
              {newCount > 0
                ? `${newCount} nouvelle${newCount > 1 ? 's' : ''} carte${newCount > 1 ? 's' : ''} dans ton classeur.`
                : 'Que des cartes que tu avais déjà.'}
            </p>
            {state?.paid ? (
              <Link to="/" className="btn">
                Retour aux packs
              </Link>
            ) : (
              result.packsAvailable > 0 && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => navigate('/ouverture', { state: { packTypeId, n: Date.now() } })}
                >
                  Ouvrir un autre pack ({result.packsAvailable})
                </button>
              )
            )}
            <Link to="/classeur" className="btn btn-ghost" onClick={() => void refresh()}>
              Voir le classeur
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
