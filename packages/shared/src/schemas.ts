import { z } from 'zod';
import { FAMILY_KEYS, GAME_STATUSES, RARITY_KEYS } from './constants';
import { FINISHES } from './player';
import { SET_TYPE_KEYS } from './progression';

export const raritySchema = z.enum(RARITY_KEYS);
export const familySchema = z.enum(FAMILY_KEYS);
export const gameStatusSchema = z.enum(GAME_STATUSES);

/** Query de `GET /games`. */
export const gamesSearchQuerySchema = z.object({
  search: z.string().trim().min(2).max(100),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type GamesSearchQuery = z.infer<typeof gamesSearchQuerySchema>;

export const cardDtoSchema = z.object({
  cardId: z.number().int(),
  seriesCode: z.string(),
  rarity: raritySchema,
  rarityLabel: z.string(),
  rarityColor: z.string().nullable(),
  cost: z.number().int(),
  family: familySchema,
  familyLabel: z.string(),
  atk: z.number().int(),
  def: z.number().int(),
  hp: z.number().int(),
  spd: z.number().int(),
  scoreAtPrint: z.number(),
});
export type CardDto = z.infer<typeof cardDtoSchema>;

export const gameDtoSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  releaseYear: z.number().int().nullable(),
  coverUrl: z.string().nullable(),
  developer: z.string().nullable(),
  totalRating: z.number().nullable(),
  totalRatingCount: z.number().int(),
  card: cardDtoSchema.nullable(),
});
export type GameDto = z.infer<typeof gameDtoSchema>;

export const gamesSearchResponseSchema = z.object({ games: z.array(gameDtoSchema) });
export type GamesSearchResponse = z.infer<typeof gamesSearchResponseSchema>;

/** URL d'une jaquette IGDB (gabarit `t_cover_big` par défaut). */
export function igdbCoverUrl(imageId: string, size = 't_cover_big'): string {
  return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
}

/* ---------- Comptes (email + mot de passe, 15 ans minimum) ---------- */

export const MIN_AGE = 15;

const emailSchema = z.string().trim().toLowerCase().pipe(z.email()).pipe(z.string().max(254));

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{3,20}$/, '3 à 20 caractères : lettres, chiffres, _ et -'),
  email: emailSchema,
  password: z.string().min(10).max(200),
  /** Pays déclaré (ISO 3166-1 alpha-2), utilisé plus tard pour les fonctions payantes (spec §17.9). */
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/),
  /** Case « J'ai 15 ans ou plus ». */
  ageConfirmed: z.literal(true),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
});

/* ---------- Packs et collection ---------- */

export const openPackSchema = z.object({
  packTypeId: z.number().int().positive(),
  idempotencyKey: z.uuid(),
  /** Payer en éclats un pack standard quand le stock est vide. */
  useShards: z.boolean().default(false),
});

export const recycleSchema = z.object({
  cardId: z.number().int().positive(),
  finish: z.string().min(1).max(40),
  /** Exemplaires à recycler ; un exemplaire est toujours gardé. */
  quantity: z.number().int().positive(),
});

export const setsQuerySchema = z.object({
  type: z.enum(SET_TYPE_KEYS),
  search: z.string().trim().min(1).max(100).optional(),
  sort: z.enum(['progress', 'size', 'name']).default('progress'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const setCardsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(60),
  missing: z.enum(['all', 'owned', 'missing']).default('all'),
});

export const finishSchema = z.enum(FINISHES);

export const collectionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  rarity: raritySchema.optional(),
  family: familySchema.optional(),
  search: z.string().trim().min(1).max(100).optional(),
  sort: z.enum(['recent', 'rarity', 'name', 'year']).default('recent'),
});
export type CollectionQuery = z.infer<typeof collectionQuerySchema>;

/* ---------- Vue d'une carte (tous les écrans du jeu) ---------- */

export interface CardView {
  cardId: number;
  gameId: number;
  /** Numéro affiché, ex. « #0655 ». */
  number: string;
  seriesCode: string;
  name: string;
  year: number | null;
  /** Plateforme principale (abréviation), `null` si inconnue. */
  platform: string | null;
  rarity: z.infer<typeof raritySchema>;
  rarityLabel: string;
  cost: number;
  family: z.infer<typeof familySchema>;
  familyLabel: string;
  atk: number;
  def: number;
  hp: number;
  spd: number;
  coverUrl: string | null;
}

/** Numéro de collection affiché sur la carte, ex. 655 → « #0655 ». */
export function cardNumber(number: number): string {
  return `#${String(number).padStart(4, '0')}`;
}
