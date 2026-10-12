import { parseArgs } from 'node:util';
import { createDb } from '@pixpedia/db';
import { loadIgdbEnv } from './config';
import { IgdbClient } from './igdb/client';
import { runImport } from './import';
import { probe } from './probe';
import { formatReport, emptyReport } from './report';
import { runSchedule } from './schedule';
import { printSeries } from './series';

const log = (m: string) => console.log(m);
const DEFAULT_SERIES = 'S0';

const USAGE = `Usage : cli <commande> [options]
  probe                         Vérifie l'accès IGDB et affiche les valeurs utiles aux filtres
  import [--limit N] [--after-id N] [--no-series]
                                Import complet du catalogue (pagination par id)
  sync [--no-series]            Synchronisation incrémentale (updated_at)
  series [--code S0]            Recalcule une série brouillon (rareté + stats figées)
  schedule                      Lance la sync incrémentale chaque jour à WORKER_SYNC_HOUR`;

function makeIgdb(): IgdbClient {
  const env = loadIgdbEnv();
  return new IgdbClient({
    clientId: env.TWITCH_CLIENT_ID,
    clientSecret: env.TWITCH_CLIENT_SECRET,
    requestsPerSecond: env.IGDB_RPS,
    maxConcurrent: env.IGDB_MAX_CONCURRENCY,
    log,
  });
}

function intOption(v: string | undefined, name: string): number | undefined {
  if (v === undefined) return undefined;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) throw new Error(`--${name} doit être un entier positif`);
  return n;
}

async function main(): Promise<void> {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      limit: { type: 'string' },
      'after-id': { type: 'string' },
      'no-series': { type: 'boolean', default: false },
      code: { type: 'string', default: DEFAULT_SERIES },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
  const command = positionals[0];
  if (!command || values.help) {
    log(USAGE);
    return;
  }

  if (command === 'schedule') {
    await runSchedule({ makeIgdb, seriesCode: DEFAULT_SERIES, log });
    return;
  }
  if (command === 'probe') {
    await probe(makeIgdb(), log);
    return;
  }

  const { db, pool } = createDb();
  try {
    const seriesCode = values['no-series'] ? null : DEFAULT_SERIES;
    switch (command) {
      case 'import':
        await runImport(db, makeIgdb(), {
          kind: 'full',
          limit: intOption(values.limit, 'limit'),
          afterId: intOption(values['after-id'], 'after-id'),
          seriesCode,
          log,
        });
        break;
      case 'sync':
        await runImport(db, makeIgdb(), { kind: 'incremental', seriesCode, log });
        break;
      case 'series': {
        const started = Date.now();
        const report = emptyReport('series');
        report.series = await printSeries(db, values.code, log);
        report.durationMs = Date.now() - started;
        log(formatReport(report));
        break;
      }
      default:
        log(USAGE);
        process.exitCode = 1;
    }
  } finally {
    await pool.end();
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
