import type { CardView, Family, Finish, Rarity, SetType, SlotOdds } from '@pixpedia/shared';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

/** Messages affichés pour les codes d'erreur de l'API. */
const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email ou mot de passe incorrect.',
  username_taken: 'Ce pseudo est déjà pris.',
  account_exists: 'Un compte existe déjà avec cet email.',
  invalid_input: 'Certains champs ne sont pas valides.',
  no_packs_available: 'Plus de pack disponible pour le moment.',
  not_enough_duplicates: 'Pas assez de doublons à recycler.',
  pack_type_not_found: 'Ce pack n’est plus disponible.',
  not_enough_shards: 'Pas assez d’éclats.',
  unauthenticated: 'Connecte-toi pour continuer.',
  rate_limited: 'Trop de tentatives, réessaie dans un moment.',
  network: 'Le serveur ne répond pas. Vérifie ta connexion.',
};

export function errorMessage(err: unknown): string {
  const code = err instanceof ApiError ? err.code : 'network';
  return MESSAGES[code] ?? 'Une erreur est survenue.';
}

/** Appelle l'API sur `<base>/api` (même origine : le cookie de session suit). */
export async function api<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${import.meta.env.BASE_URL}api${path}`, {
      method: init.method ?? 'GET',
      credentials: 'same-origin',
      headers: init.body === undefined ? undefined : { 'content-type': 'application/json' },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError(0, 'network');
  }
  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, res.status === 429 ? 'rate_limited' : (json.error ?? 'unknown'));
  }
  return json as T;
}

export interface Me {
  id: number;
  username: string;
  countryCode: string;
  emailVerified: boolean;
  packsAvailable: number;
  packsMax: number;
  nextPackAt: string | null;
  pityCounter: number;
  shards: number;
  coins: number;
  reducedMotion: boolean;
  /** false tant que le joueur n'a jamais vu d'animation Hall of Fame. */
  hofSeen: boolean;
}

export interface PackType {
  id: number;
  code: string;
  name: string;
  cost: number;
  odds: SlotOdds[];
}

export type DrawnCard = CardView & { finish: Finish; isNew: boolean };

/** Ouverture : cartes cachées, seules celles déjà révélées sont renvoyées (règle anti-fuite). */
export interface OpenResult {
  openingId: number;
  total: number;
  revealedCount: number;
  revealed: DrawnCard[];
  replayed: boolean;
  packsAvailable: number;
  nextPackAt: string | null;
  pityCounter: number;
  shards: number;
}

export type OwnedCard = CardView & {
  finish: string;
  isBound: boolean;
  quantity: number;
  isFavorite: boolean;
  firstObtainedAt: string;
};

export interface CollectionPage {
  page: number;
  pageSize: number;
  total: number;
  cards: OwnedCard[];
}

export interface CollectionFilters {
  rarity?: Rarity;
  family?: Family;
  search?: string;
  sort: 'recent' | 'rarity' | 'name' | 'year';
}

export type CardDetail = CardView & {
  summary: string | null;
  developer: string | null;
  platforms: string[];
  igdbUrl: string;
  owned: { finish: string; isBound: boolean; quantity: number; firstObtainedAt: string }[];
};

export interface PacksResponse {
  packs: PackType[];
  extraStandardPackShards: number;
}

export interface SetEntry {
  type: SetType;
  key: string;
  name: string;
  total: number;
  owned: number;
}

export interface SetsPage {
  page: number;
  pageSize: number;
  total: number;
  sets: SetEntry[];
}

export interface SetsSummary {
  types: { type: SetType; sets: number; started: number; completed: number }[];
}

export interface SetDetail {
  type: SetType;
  key: string;
  name: string;
  total: number;
  owned: number;
  page: number;
  pageSize: number;
  matching: number;
  cards: (CardView & { owned: boolean })[];
}

export interface RecycleResult {
  copies: number;
  shardsGained: number;
  shards: number | null;
}
