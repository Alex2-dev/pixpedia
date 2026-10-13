import { RARITIES, RARITY_KEYS, type Rarity } from '@pixpedia/shared';
import type { IgdbStats } from './igdb/client';
import type { PoolSummary } from './pool';
import type { SetsSummary } from './sets';

export interface SeriesSummary {
  code: string;
  cards: number;
  catalogueMean: number;
  distribution: Record<Rarity, number>;
  pools: PoolSummary[];
  sets: SetsSummary;
}

export interface RunReport {
  kind: 'full' | 'incremental' | 'series';
  startedAt: string;
  durationMs: number;
  fetched: number;
  added: number;
  updated: number;
  eligible: number;
  excluded: number;
  quarantined: number;
  excludedByReason: Record<string, number>;
  quarantinedByReason: Record<string, number>;
  reclassified: number;
  references?: { platforms: number; genres: number; themes: number };
  igdb?: IgdbStats;
  series?: SeriesSummary;
}

export function emptyReport(kind: RunReport['kind']): RunReport {
  return {
    kind,
    startedAt: new Date().toISOString(),
    durationMs: 0,
    fetched: 0,
    added: 0,
    updated: 0,
    eligible: 0,
    excluded: 0,
    quarantined: 0,
    excludedByReason: {},
    quarantinedByReason: {},
    reclassified: 0,
  };
}

export function countStatus(
  report: RunReport,
  status: 'eligible' | 'quarantine' | 'excluded',
  reason: string | null,
): void {
  if (status === 'eligible') {
    report.eligible++;
    return;
  }
  const bucket = status === 'excluded' ? report.excludedByReason : report.quarantinedByReason;
  if (status === 'excluded') report.excluded++;
  else report.quarantined++;
  const key = reason ?? 'unknown';
  bucket[key] = (bucket[key] ?? 0) + 1;
}

export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m} min ${s % 60} s` : `${Math.floor(m / 60)} h ${m % 60} min`;
}

const fr = (n: number) => n.toLocaleString('fr-FR');

function reasons(byReason: Record<string, number>): string[] {
  return Object.entries(byReason)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, n]) => `      ${reason.padEnd(40)} ${fr(n)}`);
}

/** Rapport lisible en console. */
export function formatReport(r: RunReport): string {
  const title = {
    full: 'Import complet',
    incremental: 'Synchronisation incrémentale',
    series: 'Calcul de série',
  }[r.kind];
  const lines = [
    ``,
    `=== ${title} — rapport ===`,
    `  Durée                ${formatDuration(r.durationMs)}`,
  ];
  if (r.kind !== 'series') {
    lines.push(
      `  Jeux reçus d'IGDB    ${fr(r.fetched)}`,
      `  Nouveaux / mis à jour ${fr(r.added)} / ${fr(r.updated)}`,
      `  Inclus               ${fr(r.eligible)}`,
      `  Exclus               ${fr(r.excluded)}`,
      ...reasons(r.excludedByReason),
      `  En quarantaine       ${fr(r.quarantined)}`,
      ...reasons(r.quarantinedByReason),
    );
    if (r.reclassified) lines.push(`  Reclassés (sortis depuis) ${fr(r.reclassified)}`);
  }
  if (r.references) {
    lines.push(
      `  Références           ${r.references.platforms} plateformes, ${r.references.genres} genres, ${r.references.themes} thèmes`,
    );
  }
  if (r.igdb) {
    lines.push(
      `  Requêtes IGDB        ${fr(r.igdb.requests)} (nouveaux essais : ${r.igdb.retries}, dont 429 : ${r.igdb.rateLimited})`,
    );
  }
  if (r.series) {
    lines.push(
      `  Série ${r.series.code}             ${fr(r.series.cards)} cartes, moyenne C = ${r.series.catalogueMean.toFixed(1)}`,
      ...RARITY_KEYS.slice()
        .reverse()
        .map((k) => `      ${RARITIES[k].label.padEnd(14)} ${fr(r.series!.distribution[k])}`),
    );
    lines.push(
      `  Sets                 ${Object.entries(r.series.sets)
        .map(([type, n]) => `${type} ${fr(n)}`)
        .join(', ')}`,
    );
    for (const pool of r.series.pools) {
      const total = Object.values(pool.counts).reduce((a, b) => a + b, 0);
      lines.push(`  Pool de tirage « ${pool.packType} »  ${fr(total)} cartes tirables`);
    }
  }
  return lines.join('\n');
}
