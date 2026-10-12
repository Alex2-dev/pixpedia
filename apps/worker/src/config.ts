import { z } from 'zod';

const igdbEnvSchema = z.object({
  TWITCH_CLIENT_ID: z.string().min(1, 'TWITCH_CLIENT_ID manquant dans .env'),
  TWITCH_CLIENT_SECRET: z.string().min(1, 'TWITCH_CLIENT_SECRET manquant dans .env'),
  // Plafonds IGDB : 4 req/s et 8 requêtes en parallèle, jamais au-delà.
  IGDB_RPS: z.coerce.number().positive().max(4).default(4),
  IGDB_MAX_CONCURRENCY: z.coerce.number().int().positive().max(8).default(8),
});

export type IgdbEnv = z.infer<typeof igdbEnvSchema>;

export function loadIgdbEnv(env: NodeJS.ProcessEnv = process.env): IgdbEnv {
  const parsed = igdbEnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(
      `Configuration IGDB invalide :\n${parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')}`,
    );
  }
  return parsed.data;
}

export function hasIgdbCredentials(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.TWITCH_CLIENT_ID && env.TWITCH_CLIENT_SECRET);
}
