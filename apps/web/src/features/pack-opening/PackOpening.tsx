import { useEffect, useState, type CSSProperties } from 'react';
import { dropOf, getRevealAnimation, type Rarity } from '@pixpedia/shared';
import { DropOverlay } from '../../components/drop/DropOverlay';
import type { DropCue } from '../../components/drop/useDropSequence';
import { useStageScale } from '../../components/drop/useStageScale';
import { PackStack } from './PackStack';
import { RevealRecap } from './RevealRecap';
import { RevealStage } from './RevealStage';
import { TearAnimation } from './TearAnimation';
import { tearDurationMs, type OpeningCard, type OpeningPhase, type RevealSource } from './types';
import './opening.css';

export interface PackOpeningProps {
  packCount: number;
  /** Nom du pack, ex. « Pack standard ». */
  packName: string;
  /**
   * Cartes tirées par le serveur, cachées : chacune n'est demandée qu'au toucher qui la retourne.
   * `null` tant que l'ouverture n'a pas répondu (la déchirure peut commencer).
   */
  source: RevealSource | null;
  error?: string | null;
  /** prefers-reduced-motion ou option « Animations réduites » du profil. */
  reduced: boolean;
  /** Le joueur a déjà vu un Hall of Fame (sinon le saut est bloqué 1,5 s). */
  hofSeen: boolean;
  chance: (r: Rarity) => { pct: string; oneIn: number | null };
  /** Pseudo du joueur, pour le bandeau Hall of Fame. */
  username?: string;
  replayLabel: string;
  onAddToCodex: () => void;
  onReplay: () => void;
  onClose: () => void;
  onHofSeen?: () => void;
  onCue?: (cue: DropCue) => void;
}

/** Ouverture de packs : idle → tearing → reveal → recap (maquette pixpedia-animations.html). */
export function PackOpening(props: PackOpeningProps) {
  const { packCount, source, reduced } = props;
  const [phase, setPhase] = useState<OpeningPhase>('idle');
  const [tearDone, setTearDone] = useState(false);
  const [shown, setShown] = useState(0);
  const [up, setUp] = useState(false);
  const [afterDrop, setAfterDrop] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [hofSeen, setHofSeen] = useState(props.hofSeen);
  const [known, setKnown] = useState<(OpeningCard | undefined)[]>([]);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const scale = useStageScale();

  const total = source?.slots.length ?? 0;
  const cardAt = (i: number) => known[i] ?? source?.initial[i];

  // Fin de la déchirure : 1,75 s pour 1 pack, 3,26 s pour 7 (0,3 s en mode réduit).
  useEffect(() => {
    if (phase !== 'tearing') return;
    const t = setTimeout(() => setTearDone(true), reduced ? 300 : tearDurationMs(packCount));
    return () => clearTimeout(t);
  }, [phase, packCount, reduced]);

  // Révélation dès que la déchirure est finie et que le serveur a répondu.
  const revealing = phase === 'tearing' && tearDone && total > 0;
  const currentPhase: OpeningPhase = revealing ? 'reveal' : phase;
  useEffect(() => {
    if (revealing) {
      const t = setTimeout(() => setPhase('reveal'));
      return () => clearTimeout(t);
    }
  }, [revealing]);

  // Carte courante : connue seulement une fois révélée par le serveur.
  const item = cardAt(shown);

  const learn = (cards: Record<number, OpeningCard>) =>
    setKnown((k) => {
      const next = [...k];
      for (const [i, c] of Object.entries(cards)) next[Number(i)] = c;
      return next;
    });

  const tap = async () => {
    if (!source || pending) return;
    if (!up) {
      let card = item;
      if (!card) {
        setPending(true);
        setFailure(null);
        try {
          card = await source.reveal(shown);
          learn({ [shown]: card });
        } catch {
          setFailure('Connexion perdue, touche la carte pour réessayer.');
          return;
        } finally {
          setPending(false);
        }
      }
      if (dropOf(getRevealAnimation(card.rarity, card.card.finish))) setDropOpen(true);
      else setUp(true);
      return;
    }
    if (shown >= total - 1) {
      setPhase('recap');
      return;
    }
    setShown(shown + 1);
    setUp(false);
    setAfterDrop(false);
  };

  const headline =
    currentPhase === 'idle'
      ? packCount > 1
        ? `${packCount} PACKS À OUVRIR`
        : '1 PACK À OUVRIR'
      : currentPhase === 'tearing'
        ? 'DÉCHIRURE…'
        : currentPhase === 'reveal'
          ? `CARTE ${shown + 1} / ${total}`
          : 'RÉCAP';
  const kicker =
    currentPhase === 'reveal' && source
      ? `PACK ${source.slots[shown]} / ${packCount}`
      : props.packName.toUpperCase();
  const label = `${props.packName.toUpperCase()} · 5 CARTES`;

  return (
    <div
      className={`op-screen${reduced ? ' op-reduced' : ''}`}
      data-testid="pack-opening"
      data-phase={currentPhase}
    >
      <div className="op-stage" style={{ ['--op-scale' as string]: scale } as CSSProperties}>
        <div className="op-head">
          <div className="op-kicker">{kicker}</div>
          <div className="op-headline">{headline}</div>
        </div>

        {currentPhase === 'idle' && (
          <>
            <button type="button" className="op-close" aria-label="Fermer" onClick={props.onClose}>
              ✕
            </button>
            <PackStack count={packCount} label={label} />
            <div className="op-bottom">
              {props.error ? (
                <p
                  className="op-hint"
                  style={{ textAlign: 'center', color: '#FF6B6B' }}
                  role="alert"
                >
                  {props.error}
                </p>
              ) : (
                <button
                  type="button"
                  className="op-btn"
                  data-testid="tear"
                  onClick={() => setPhase('tearing')}
                >
                  {packCount > 1 ? `DÉCHIRER LES ${packCount} PACKS` : 'DÉCHIRER LE PACK'}
                </button>
              )}
            </div>
          </>
        )}

        {currentPhase === 'tearing' && (
          <>
            <TearAnimation count={packCount} label={label} />
            {tearDone && !total && (
              <div className="op-bottom">
                <p
                  className="op-hint"
                  style={{ textAlign: 'center', color: props.error ? '#FF6B6B' : undefined }}
                >
                  {props.error ?? 'Le serveur prépare tes cartes…'}
                </p>
                {props.error && (
                  <button type="button" className="op-btn-ghost" onClick={props.onClose}>
                    Retour aux packs
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {currentPhase === 'reveal' && (
          <RevealStage
            index={shown}
            item={up && item ? item : null}
            afterDrop={afterDrop}
            pct={up && item ? props.chance(item.rarity).pct : ''}
            remaining={total - shown - 1}
            pending={pending}
            failure={failure}
            onTap={() => void tap()}
            onRevealAll={() => {
              if (!source || pending) return;
              setPending(true);
              source.revealAll().then(
                (all) => {
                  learn({ ...all });
                  setPending(false);
                  setPhase('recap');
                },
                () => {
                  setPending(false);
                  setFailure('Connexion perdue, réessaie « Tout révéler ».');
                },
              );
            }}
          />
        )}

        {currentPhase === 'recap' && (
          <RevealRecap
            cards={(source?.slots ?? []).map((_, i) => cardAt(i)).filter((c) => c !== undefined)}
            packCount={packCount}
            onAddToCodex={props.onAddToCodex}
            onReplay={props.onReplay}
            replayLabel={props.replayLabel}
          />
        )}
      </div>

      {dropOpen && item && (
        <DropOverlay
          card={item.card}
          chance={props.chance(item.rarity)}
          mode="opening"
          reduced={reduced}
          firstHof={item.rarity === 'hof' && !hofSeen}
          ticker={
            props.username
              ? `${props.username.toUpperCase()} A TIRÉ ${item.card.name.toUpperCase()}`
              : undefined
          }
          onCue={props.onCue}
          onHofSeen={() => {
            if (!hofSeen) {
              setHofSeen(true);
              props.onHofSeen?.();
            }
          }}
          onClose={() => {
            setDropOpen(false);
            setUp(true);
            setAfterDrop(true);
          }}
        />
      )}
    </div>
  );
}
