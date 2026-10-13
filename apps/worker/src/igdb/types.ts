/** Sous-ensemble des réponses IGDB utilisé par Pixpedia. */
export interface IgdbRef {
  id: number;
  name: string;
  slug: string;
}

export interface IgdbPlatform extends IgdbRef {
  abbreviation?: string;
}

export interface IgdbGame {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  first_release_date?: number;
  cover?: { id: number; image_id: string };
  game_type?: number;
  total_rating?: number;
  total_rating_count?: number;
  platforms?: number[];
  genres?: number[];
  themes?: number[];
  keywords?: { id: number; name: string }[];
  age_ratings?: {
    id: number;
    organization?: { id: number; name: string };
    rating_category?: { id: number; rating: string };
    rating_content_descriptions?: { id: number; description: string }[];
  }[];
  involved_companies?: {
    id: number;
    developer: boolean;
    publisher?: boolean;
    company?: { id: number; name: string; slug?: string };
  }[];
  /** Franchise principale et franchises secondaires. */
  franchise?: { id: number; name: string; slug?: string };
  franchises?: { id: number; name: string; slug?: string }[];
  updated_at?: number;
}

export interface IgdbTimeToBeat {
  id: number;
  game_id: number;
  normally?: number;
}

/** Champs demandés pour chaque jeu (spec §3.2). */
export const GAME_FIELDS = [
  'name',
  'slug',
  'summary',
  'first_release_date',
  'cover.image_id',
  'game_type',
  'total_rating',
  'total_rating_count',
  'platforms',
  'genres',
  'themes',
  'keywords.name',
  'age_ratings.organization.name',
  'age_ratings.rating_category.rating',
  'age_ratings.rating_content_descriptions.description',
  'involved_companies.company.name',
  'involved_companies.company.slug',
  'involved_companies.developer',
  'involved_companies.publisher',
  'franchise.name',
  'franchise.slug',
  'franchises.name',
  'franchises.slug',
  'updated_at',
].join(',');
