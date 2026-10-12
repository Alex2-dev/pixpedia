import { z } from 'zod';
import { FAMILY_KEYS, GAME_STATUSES, RARITY_KEYS } from './constants';

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
