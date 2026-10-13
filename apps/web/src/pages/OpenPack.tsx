import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  DEFAULT_PACK_ODDS,
  formatChance,
  perCardChance,
  type Rarity,
  type SlotOdds,
} from '@pixpedia/shared';
import { api, errorMessage, type DrawnCard, type OpenResult, type PacksResponse } from '../api';
import { toCardData } from '../card/adapt';
import { PackOpening } from '../features/pack-opening/PackOpening';
import type { OpeningCard, RevealSource } from '../features/pack-opening/types';
import { useSession } from '../session';
import { useReducedMotionPref } from '../useReducedMotion';

export interface OpenPackState {
  packTypeId: number;
  /** Payer en éclats un pack standard quand le stock est vide. */
  useShards: boolean;
  /** Pack payé en éclats : « Rejouer » ramène à l'accueil au lieu de rouvrir. */
  paid: boolean;
  /**
   * Une clé d'idempotence par pack, créées au clic et gardées dans l'historique du navigateur :
   * recharger la page rejoue les mêmes tirages au lieu d'ouvrir de nouveaux packs.
   */
  keys: string[];
}

export function openPackState(
  packTypeId: number,
  {
    count = 1,
    useShards = false,
    paid = useShards,
  }: { count?: number; useShards?: boolean; paid?: boolean } = {},
): OpenPackState {
  return {
    packTypeId,
    useShards,
    paid,
    keys: Array.from({ length: count }, () => crypto.randomUUID()),
  };
}

/**
 * Ouverture d'un ou plusieurs packs. Les tirages sont décidés par le serveur (spec §8.4) dès
 * l'arrivée sur l'écran, mais il ne dévoile chaque carte qu'au toucher qui la retourne (règle
 * anti-fuite) : `/packs/openings/:id/reveal`, ou `reveal-all` pour « Tout révéler ».
 */
export function OpenPack() {
  const location = useLocation();
  const navigate = useNavigate();
  const { me, setMe, refresh } = useSession();
  const reduced = useReducedMotionPref();
  const state = location.state as Partial<OpenPackState> | null;
  const keys = state?.keys;
  const packTypeId = state?.packTypeId;
  const [source, setSource] = useState<RevealSource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<OpenResult | null>(null);
  const [pack, setPack] = useState<{ name: string; odds: SlotOdds[] }>({
    name: 'Pack',
    odds: DEFAULT_PACK_ODDS,
  });

  useEffect(() => {
    if (!packTypeId) return;
    api<PacksResponse>('/packs').then(
      (r) => {
        const p = r.packs.find((x) => x.id === packTypeId);
        if (p) setPack({ name: p.name, odds: p.odds });
      },
      () => {},
    );
  }, [packTypeId]);

  useEffect(() => {
    if (!packTypeId || !keys?.length) return;
    let cancelled = false;
    (async () => {
      const opened: OpenResult[] = [];
      for (const [i, key] of keys.entries()) {
        try {
          opened.push(
            await api<OpenResult>('/packs/open', {
              method: 'POST',
              body: { packTypeId, idempotencyKey: key, useShards: state?.useShards ?? false },
            }),
          );
        } catch (err) {
          if (!cancelled) {
            setError(
              opened.length
                ? `Seuls ${i} pack${i > 1 ? 's ont pu être ouverts' : ' a pu être ouvert'}. ${errorMessage(err)}`
                : errorMessage(err),
            );
          }
          break;
        }
      }
      if (cancelled || !opened.length) return;
      setSource(serverSource(opened));
      setLast(opened[opened.length - 1]!);
    })();
    return () => {
      cancelled = true;
    };
    // Les clés suffisent à identifier les tirages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packTypeId, keys?.join()]);

  // Stock et éclats à jour dans l'en-tête dès que les tirages sont connus.
  useEffect(() => {
    if (last && me) {
      setMe({
        ...me,
        packsAvailable: last.packsAvailable,
        nextPackAt: last.nextPackAt,
        pityCounter: last.pityCounter,
        shards: last.shards,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last]);

  if (!packTypeId || !keys?.length) return <Navigate to="/" replace />;

  const count = keys.length;
  const canReplay = !state?.paid && (last?.packsAvailable ?? 0) > 0;
  const replayCount = Math.min(count, last?.packsAvailable ?? 0);

  return (
    <PackOpening
      packCount={source ? source.slots[source.slots.length - 1]! : count}
      packName={pack.name}
      source={source}
      error={error}
      reduced={reduced}
      hofSeen={me?.hofSeen ?? true}
      username={me?.username}
      chance={(r: Rarity) => formatChance(perCardChance(r, pack.odds))}
      replayLabel={
        canReplay
          ? `Rejouer (${replayCount} pack${replayCount > 1 ? 's' : ''})`
          : 'Retour aux packs'
      }
      onAddToCodex={() => {
        void refresh();
        navigate('/codex');
      }}
      onReplay={() =>
        canReplay
          ? navigate('/ouverture', { state: openPackState(packTypeId, { count: replayCount }) })
          : navigate('/')
      }
      onClose={() => navigate('/')}
      onHofSeen={() => {
        void api('/me/hof-seen', { method: 'POST' }).catch(() => {});
      }}
    />
  );
}

/** Cartes cachées de plusieurs ouvertures, mises bout à bout (pack 1, puis pack 2…). */
function serverSource(openings: readonly OpenResult[]): RevealSource {
  const toOpening = (c: DrawnCard, pack: number): OpeningCard => ({
    card: toCardData(c),
    rarity: c.rarity,
    pack,
    isNew: c.isNew,
  });
  const slots: number[] = [];
  const initial: (OpeningCard | undefined)[] = [];
  const where: { opening: OpenResult; index: number }[] = [];
  openings.forEach((o, p) => {
    for (let i = 0; i < o.total; i++) {
      slots.push(p + 1);
      const seen = o.revealed[i];
      initial.push(seen && toOpening(seen, p + 1));
      where.push({ opening: o, index: i });
    }
  });
  return {
    slots,
    initial,
    async reveal(at) {
      const { opening, index } = where[at]!;
      const r = await api<{ card: DrawnCard }>(`/packs/openings/${opening.openingId}/reveal`, {
        method: 'POST',
        body: { index },
      });
      return toOpening(r.card, slots[at]!);
    },
    async revealAll() {
      const all: OpeningCard[] = [];
      for (const [p, o] of openings.entries()) {
        const r = await api<{ cards: DrawnCard[] }>(`/packs/openings/${o.openingId}/reveal-all`, {
          method: 'POST',
        });
        all.push(...r.cards.map((c) => toOpening(c, p + 1)));
      }
      return all;
    },
  };
}
