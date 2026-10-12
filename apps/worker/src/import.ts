import { eq, sql } from 'drizzle-orm';
import { syncRuns, type Db } from '@pixpedia/db';
import { INCLUDED_GAME_TYPES, classifyGame } from '@pixpedia/shared';
import type { IgdbClient } from './igdb/client';
import { GAME_FIELDS, type IgdbGame, type IgdbTimeToBeat } from './igdb/types';
import { normalizeGame, type ReferenceData } from './normalize';
import { importReferences, loadReferenceData } from './references';
import { countStatus, emptyReport, formatReport, type RunReport } from './report';
import { latestIgdbUpdate, upsertGames } from './repository';
import { printSeries } from './series';

const PAGE_SIZE = 500;

export interface RunOptions {
  kind: 'full' | 'incremental';
  /** Nombre maximum de jeux à récupérer (tests, démo). */
  limit?: number;
  /** Reprendre un import complet après cet id IGDB. */
  afterId?: number;
  /** Code de la série brouillon à recalculer en fin d'import, `null` pour ne pas la calculer. */
  seriesCode: string | null;
  log: (m: string) => void;
}

/** Filtre APICalypse d'une page de jeux. */
export function gamesWhere(kind: RunOptions['kind'], afterId: number, since: Date | null): string {
  if (kind === 'incremental') {
    // En incrémental on prend tout ce qui a bougé, pour pouvoir aussi exclure un jeu.
    return `where updated_at > ${Math.floor((since as Date).getTime() / 1000)} & id > ${afterId}`;
  }
  return `where id > ${afterId} & game_type = (${INCLUDED_GAME_TYPES.join(',')}) & cover != null`;
}

async function fetchTimeToBeat(igdb: IgdbClient, ids: number[]): Promise<Map<number, number>> {
  if (!ids.length) return new Map();
  const rows = await igdb.query<IgdbTimeToBeat>(
    'game_time_to_beats',
    `fields game_id,normally; where game_id = (${ids.join(',')}); limit ${PAGE_SIZE};`,
  );
  return new Map(rows.filter((r) => r.normally).map((r) => [r.game_id, r.normally as number]));
}

/** Les jeux exclus comme « non sortis » dont la date est passée sont reclassés depuis la base. */
async function reclassifyReleased(db: Db, refs: ReferenceData): Promise<number> {
  const { rows } = await db.execute<{
    id: number;
    name: string;
    game_type: number | null;
    first_release_date: string;
    cover_image_id: string | null;
    keywords: string[];
    content_descriptors: string[];
    esrb_adults_only: boolean;
    total_rating_count: number;
    platform_ids: number[];
    theme_ids: number[];
  }>(sql`
    select g.id, g.name, g.game_type, g.first_release_date, g.cover_image_id, g.keywords,
           g.content_descriptors, g.esrb_adults_only, g.total_rating_count,
           coalesce((select array_agg(platform_id) from game_platforms where game_id = g.id), '{}') as platform_ids,
           coalesce((select array_agg(theme_id) from game_themes where game_id = g.id), '{}') as theme_ids
    from games g
    where g.status_reason = 'inclusion:unreleased' and g.first_release_date <= current_date
  `);
  for (const g of rows) {
    const c = classifyGame({
      name: g.name,
      gameType: g.game_type,
      firstReleaseDate: new Date(g.first_release_date),
      hasCover: Boolean(g.cover_image_id),
      hasOfficialPlatform: g.platform_ids.some((id) => refs.officialPlatformIds.has(id)),
      themeSlugs: g.theme_ids.map((id) => refs.themeSlugById.get(id) ?? ''),
      keywords: g.keywords,
      esrbAdultsOnly: g.esrb_adults_only,
      contentDescriptors: g.content_descriptors,
      votes: g.total_rating_count,
      isBlocked: refs.blockedIds.has(g.id),
    });
    await db.execute(sql`
      update games set status = ${c.status}, status_reason = ${c.reason}, is_drawable = ${c.status === 'eligible'}
      where id = ${g.id}
    `);
  }
  return rows.length;
}

/** Pipeline d'import ou de synchronisation (spec §3.4), journalisé dans `sync_runs`. */
export async function runImport(db: Db, igdb: IgdbClient, opts: RunOptions): Promise<RunReport> {
  const started = Date.now();
  const report = emptyReport(opts.kind);
  const [run] = await db
    .insert(syncRuns)
    .values({ kind: opts.kind })
    .returning({ id: syncRuns.id });
  const runId = run!.id;

  try {
    let since: Date | null = null;
    if (opts.kind === 'incremental') {
      since = await latestIgdbUpdate(db);
      if (!since) throw new Error('Base vide : lancer d’abord `pnpm worker:import`.');
      opts.log(`Synchronisation des jeux modifiés depuis le ${since.toISOString()}.`);
    }

    opts.log('Import des références (plateformes, genres, thèmes)…');
    report.references = await importReferences(db, igdb);
    const refs = await loadReferenceData(db);

    const remaining = () =>
      opts.limit === undefined ? PAGE_SIZE : Math.min(PAGE_SIZE, opts.limit - report.fetched);
    const fetchPage = (afterId: number, size: number) => {
      const p = igdb.query<IgdbGame>(
        'games',
        `fields ${GAME_FIELDS}; ${gamesWhere(opts.kind, afterId, since)}; sort id asc; limit ${size};`,
      );
      // Préchargée : l'erreur sera relevée au `await`, pas en rejet non géré.
      p.catch(() => {});
      return p;
    };

    // La page suivante se télécharge pendant le traitement de la page courante.
    let requested = remaining();
    let next: Promise<IgdbGame[]> | null =
      requested > 0 ? fetchPage(opts.afterId ?? 0, requested) : null;
    while (next) {
      const page = await next;
      if (!page.length) break;
      const pageWasFull = page.length === requested;
      report.fetched += page.length;
      const lastId = page.at(-1)!.id;
      requested = remaining();
      next = pageWasFull && requested > 0 ? fetchPage(lastId, requested) : null;

      const ttb = await fetchTimeToBeat(
        igdb,
        page.map((g) => g.id),
      );
      const records = page.map((g) => normalizeGame(g, refs, ttb.get(g.id) ?? null));
      for (const r of records) countStatus(report, r.row.status, r.row.statusReason);
      const { added, updated } = await upsertGames(db, records);
      report.added += added;
      report.updated += updated;
      opts.log(`  … ${report.fetched} jeux traités (dernier id ${lastId})`);
    }

    report.reclassified = await reclassifyReleased(db, refs);
    if (opts.seriesCode) report.series = await printSeries(db, opts.seriesCode, opts.log);
  } catch (err) {
    report.durationMs = Date.now() - started;
    report.igdb = { ...igdb.stats };
    await db
      .update(syncRuns)
      .set({ finishedAt: new Date(), error: String(err), report, ...counters(report) })
      .where(eq(syncRuns.id, runId));
    throw err;
  }

  report.durationMs = Date.now() - started;
  report.igdb = { ...igdb.stats };
  await db
    .update(syncRuns)
    .set({ finishedAt: new Date(), report, ...counters(report) })
    .where(eq(syncRuns.id, runId));
  opts.log(formatReport(report));
  return report;
}

function counters(r: RunReport) {
  return { added: r.added, updated: r.updated, excluded: r.excluded, quarantined: r.quarantined };
}
