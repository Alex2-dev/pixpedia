import { createDb } from '@pixpedia/db';
import { hasIgdbCredentials } from './config';
import type { IgdbClient } from './igdb/client';
import { runImport } from './import';

/** Millisecondes jusqu'au prochain `hour`:00 (heure locale du conteneur). */
export function msUntilHour(hour: number, now = new Date()): number {
  const next = new Date(now);
  next.setHours(hour, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

interface ScheduleOptions {
  makeIgdb: () => IgdbClient;
  seriesCode: string;
  log: (m: string) => void;
}

/** Synchronisation incrémentale chaque jour à `WORKER_SYNC_HOUR` (spec §3.4 : « chaque nuit »). */
export async function runSchedule(opts: ScheduleOptions): Promise<never> {
  const hour = Number(process.env.WORKER_SYNC_HOUR ?? 4);
  for (;;) {
    const wait = msUntilHour(hour);
    opts.log(`[worker] Prochaine synchronisation dans ${Math.round(wait / 60000)} min.`);
    await new Promise((r) => setTimeout(r, wait));
    if (!hasIgdbCredentials()) {
      opts.log('[worker] Identifiants Twitch absents : synchronisation ignorée.');
      continue;
    }
    const { db, pool } = createDb();
    try {
      await runImport(db, opts.makeIgdb(), {
        kind: 'incremental',
        seriesCode: opts.seriesCode,
        log: opts.log,
      });
    } catch (err) {
      console.error('[worker] Échec de la synchronisation :', err);
    } finally {
      await pool.end();
    }
  }
}
