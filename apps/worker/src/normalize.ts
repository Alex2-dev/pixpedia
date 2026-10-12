import { classifyGame, releaseDecade, type Classification } from '@pixpedia/shared';
import type { IgdbGame } from './igdb/types';

export interface ReferenceData {
  officialPlatformIds: ReadonlySet<number>;
  knownPlatformIds: ReadonlySet<number>;
  knownGenreIds: ReadonlySet<number>;
  themeSlugById: ReadonlyMap<number, string>;
  blockedIds: ReadonlySet<number>;
}

export interface GameRecord {
  row: {
    id: number;
    name: string;
    slug: string;
    summary: string | null;
    firstReleaseDate: Date | null;
    releaseDecade: number | null;
    coverImageId: string | null;
    gameType: number | null;
    totalRating: number | null;
    totalRatingCount: number;
    timeToBeatSec: number | null;
    developerName: string | null;
    keywords: string[];
    contentDescriptors: string[];
    esrbAdultsOnly: boolean;
    status: Classification['status'];
    statusReason: string | null;
    isDrawable: boolean;
    igdbUpdatedAt: Date | null;
  };
  platformIds: number[];
  genreIds: number[];
  themeIds: number[];
}

const fromUnix = (s: number | undefined) => (s === undefined ? null : new Date(s * 1000));

/** Transforme un jeu IGDB en ligne `games` + liaisons, et le classe (inclus, exclu, quarantaine). */
export function normalizeGame(
  g: IgdbGame,
  refs: ReferenceData,
  timeToBeatSec: number | null,
  now = new Date(),
): GameRecord {
  const firstReleaseDate = fromUnix(g.first_release_date);
  const platformIds = (g.platforms ?? []).filter((id) => refs.knownPlatformIds.has(id));
  const genreIds = (g.genres ?? []).filter((id) => refs.knownGenreIds.has(id));
  const themeIds = (g.themes ?? []).filter((id) => refs.themeSlugById.has(id));
  const keywords = (g.keywords ?? []).map((k) => k.name).filter(Boolean);
  const ageRatings = g.age_ratings ?? [];
  const esrbAdultsOnly = ageRatings.some(
    (r) => r.organization?.name === 'ESRB' && r.rating_category?.rating === 'AO',
  );
  const contentDescriptors = [
    ...new Set(
      ageRatings.flatMap((r) => (r.rating_content_descriptions ?? []).map((d) => d.description)),
    ),
  ].filter(Boolean);
  const totalRatingCount = g.total_rating_count ?? 0;

  const classification = classifyGame(
    {
      name: g.name,
      gameType: g.game_type ?? null,
      firstReleaseDate,
      hasCover: Boolean(g.cover?.image_id),
      hasOfficialPlatform: platformIds.some((id) => refs.officialPlatformIds.has(id)),
      themeSlugs: themeIds.map((id) => refs.themeSlugById.get(id) as string),
      keywords,
      esrbAdultsOnly,
      contentDescriptors,
      votes: totalRatingCount,
      isBlocked: refs.blockedIds.has(g.id),
    },
    now,
  );

  const developer = g.involved_companies?.find((c) => c.developer && c.company?.name);

  return {
    row: {
      id: g.id,
      name: g.name,
      slug: g.slug,
      summary: g.summary ?? null,
      firstReleaseDate,
      releaseDecade: firstReleaseDate ? releaseDecade(firstReleaseDate) : null,
      coverImageId: g.cover?.image_id ?? null,
      gameType: g.game_type ?? null,
      totalRating: g.total_rating ?? null,
      totalRatingCount,
      timeToBeatSec: timeToBeatSec && timeToBeatSec > 0 ? Math.round(timeToBeatSec) : null,
      developerName: developer?.company?.name ?? null,
      keywords,
      contentDescriptors,
      esrbAdultsOnly,
      status: classification.status,
      statusReason: classification.reason,
      isDrawable: classification.status === 'eligible',
      igdbUpdatedAt: fromUnix(g.updated_at),
    },
    platformIds,
    genreIds,
    themeIds,
  };
}
