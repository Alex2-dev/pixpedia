import { sql } from 'drizzle-orm';
import { blockedGames, genres, platforms, themes, type Db } from '@pixpedia/db';
import { platformFamily } from '@pixpedia/shared';
import type { IgdbClient } from './igdb/client';
import type { IgdbPlatform, IgdbRef } from './igdb/types';
import type { ReferenceData } from './normalize';

/** Récupère une petite table de référence IGDB en entier (pagination par id). */
async function fetchAll<T extends { id: number }>(
  igdb: IgdbClient,
  endpoint: string,
  fields: string,
): Promise<T[]> {
  const out: T[] = [];
  let afterId = 0;
  for (;;) {
    const page = await igdb.query<T>(
      endpoint,
      `fields ${fields}; where id > ${afterId}; sort id asc; limit 500;`,
    );
    out.push(...page);
    if (page.length < 500) return out;
    afterId = (page.at(-1) as T).id;
  }
}

/** Étape 2 du pipeline (spec §3.4) : plateformes, genres et thèmes. */
export async function importReferences(db: Db, igdb: IgdbClient) {
  const [plats, gens, thms] = await Promise.all([
    fetchAll<IgdbPlatform>(igdb, 'platforms', 'id,name,slug,abbreviation'),
    fetchAll<IgdbRef>(igdb, 'genres', 'id,name,slug'),
    fetchAll<IgdbRef>(igdb, 'themes', 'id,name,slug'),
  ]);

  await db.transaction(async (tx) => {
    if (plats.length) {
      await tx
        .insert(platforms)
        .values(
          plats.map((p) => {
            const family = platformFamily(p.slug);
            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              abbreviation: p.abbreviation ?? null,
              family,
              isOfficial: family !== null,
            };
          }),
        )
        .onConflictDoUpdate({
          target: platforms.id,
          set: {
            name: sql`excluded.name`,
            slug: sql`excluded.slug`,
            abbreviation: sql`excluded.abbreviation`,
            family: sql`excluded.family`,
            isOfficial: sql`excluded.is_official`,
          },
        });
    }
    for (const [table, rows] of [
      [genres, gens],
      [themes, thms],
    ] as const) {
      if (!rows.length) continue;
      await tx
        .insert(table)
        .values(rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug })))
        .onConflictDoUpdate({
          target: table.id,
          set: { name: sql`excluded.name`, slug: sql`excluded.slug` },
        });
    }
  });

  return { platforms: plats.length, genres: gens.length, themes: thms.length };
}

/** Charge les références depuis la base pour normaliser les jeux. */
export async function loadReferenceData(db: Db): Promise<ReferenceData> {
  const [plats, gens, thms, blocked] = await Promise.all([
    db.select({ id: platforms.id, isOfficial: platforms.isOfficial }).from(platforms),
    db.select({ id: genres.id }).from(genres),
    db.select({ id: themes.id, slug: themes.slug }).from(themes),
    db.select({ id: blockedGames.gameId }).from(blockedGames),
  ]);
  return {
    officialPlatformIds: new Set(plats.filter((p) => p.isOfficial).map((p) => p.id)),
    knownPlatformIds: new Set(plats.map((p) => p.id)),
    knownGenreIds: new Set(gens.map((g) => g.id)),
    themeSlugById: new Map(thms.map((t) => [t.id, t.slug])),
    blockedIds: new Set(blocked.map((b) => b.id)),
  };
}
