import {
  FAMILY_LABELS,
  RARITIES,
  igdbCoverUrl,
  type Family,
  type GameDto,
  type Rarity,
} from '@pixpedia/shared';

/** Ligne renvoyée par la requête de recherche (jeu + carte de la dernière série). */
export interface GameSearchRow {
  id: number;
  name: string;
  slug: string;
  first_release_date: string | Date | null;
  cover_image_id: string | null;
  developer_name: string | null;
  total_rating: number | null;
  total_rating_count: number;
  card_id: number | null;
  series_code: string | null;
  rarity: Rarity | null;
  family: Family | null;
  atk: number | null;
  def: number | null;
  hp: number | null;
  spd: number | null;
  score_at_print: number | null;
}

/** Échappe `%`, `_` et `\` pour un motif ILIKE. */
export function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

function releaseYear(d: string | Date | null): number | null {
  if (d === null) return null;
  const year = typeof d === 'string' ? Number(d.slice(0, 4)) : d.getUTCFullYear();
  return Number.isFinite(year) ? year : null;
}

export function toGameDto(row: GameSearchRow): GameDto {
  const hasCard = row.card_id !== null && row.rarity !== null && row.family !== null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    releaseYear: releaseYear(row.first_release_date),
    coverUrl: row.cover_image_id ? igdbCoverUrl(row.cover_image_id) : null,
    developer: row.developer_name,
    totalRating: row.total_rating === null ? null : Math.round(row.total_rating * 10) / 10,
    totalRatingCount: row.total_rating_count,
    card: hasCard
      ? {
          cardId: row.card_id as number,
          seriesCode: row.series_code ?? '',
          rarity: row.rarity as Rarity,
          rarityLabel: RARITIES[row.rarity as Rarity].label,
          rarityColor: RARITIES[row.rarity as Rarity].color,
          cost: RARITIES[row.rarity as Rarity].cost,
          family: row.family as Family,
          familyLabel: FAMILY_LABELS[row.family as Family],
          atk: row.atk ?? 0,
          def: row.def ?? 0,
          hp: row.hp ?? 0,
          spd: row.spd ?? 0,
          scoreAtPrint: Math.round((row.score_at_print ?? 0) * 10) / 10,
        }
      : null,
  };
}
