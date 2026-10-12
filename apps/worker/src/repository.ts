import { inArray, sql } from 'drizzle-orm';
import { gameGenres, gamePlatforms, gameThemes, games, type Db } from '@pixpedia/db';
import type { GameRecord } from './normalize';

export interface UpsertResult {
  added: number;
  updated: number;
}

/**
 * Enregistre un lot de jeux et remplace leurs liaisons, dans une transaction.
 * Aucun jeu n'est jamais supprimé (règle de stabilité, spec §3.4).
 */
export async function upsertGames(db: Db, records: GameRecord[]): Promise<UpsertResult> {
  if (!records.length) return { added: 0, updated: 0 };
  const ids = records.map((r) => r.row.id);

  return db.transaction(async (tx) => {
    const rows = await tx
      .insert(games)
      .values(records.map((r) => ({ ...r.row, syncedAt: new Date() })))
      .onConflictDoUpdate({
        target: games.id,
        set: {
          name: sql`excluded.name`,
          slug: sql`excluded.slug`,
          summary: sql`excluded.summary`,
          firstReleaseDate: sql`excluded.first_release_date`,
          releaseDecade: sql`excluded.release_decade`,
          coverImageId: sql`excluded.cover_image_id`,
          gameType: sql`excluded.game_type`,
          totalRating: sql`excluded.total_rating`,
          totalRatingCount: sql`excluded.total_rating_count`,
          timeToBeatSec: sql`excluded.time_to_beat_sec`,
          developerName: sql`excluded.developer_name`,
          keywords: sql`excluded.keywords`,
          contentDescriptors: sql`excluded.content_descriptors`,
          esrbAdultsOnly: sql`excluded.esrb_adults_only`,
          status: sql`excluded.status`,
          statusReason: sql`excluded.status_reason`,
          isDrawable: sql`excluded.is_drawable`,
          igdbUpdatedAt: sql`excluded.igdb_updated_at`,
          syncedAt: sql`excluded.synced_at`,
        },
      })
      // xmax = 0 : la ligne vient d'être insérée, sinon elle a été mise à jour.
      .returning({ id: games.id, inserted: sql<boolean>`(xmax = 0)` });

    await tx.delete(gamePlatforms).where(inArray(gamePlatforms.gameId, ids));
    await tx.delete(gameGenres).where(inArray(gameGenres.gameId, ids));
    await tx.delete(gameThemes).where(inArray(gameThemes.gameId, ids));

    const plat = records.flatMap((r) =>
      r.platformIds.map((platformId) => ({ gameId: r.row.id, platformId })),
    );
    const gen = records.flatMap((r) =>
      r.genreIds.map((genreId) => ({ gameId: r.row.id, genreId })),
    );
    const thm = records.flatMap((r) =>
      r.themeIds.map((themeId) => ({ gameId: r.row.id, themeId })),
    );
    if (plat.length) await tx.insert(gamePlatforms).values(plat).onConflictDoNothing();
    if (gen.length) await tx.insert(gameGenres).values(gen).onConflictDoNothing();
    if (thm.length) await tx.insert(gameThemes).values(thm).onConflictDoNothing();

    const added = rows.filter((r) => r.inserted).length;
    return { added, updated: rows.length - added };
  });
}

/** Date IGDB `updated_at` la plus récente déjà importée : point de départ de la sync incrémentale. */
export async function latestIgdbUpdate(db: Db): Promise<Date | null> {
  const [row] = await db
    .select({ max: sql<string | null>`max(${games.igdbUpdatedAt})` })
    .from(games);
  return row?.max ? new Date(row.max) : null;
}
