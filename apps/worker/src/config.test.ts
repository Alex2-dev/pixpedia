import { describe, expect, it } from 'vitest';
import { loadIgdbEnv } from './config';

const creds = { TWITCH_CLIENT_ID: 'id', TWITCH_CLIENT_SECRET: 'secret' };

describe('loadIgdbEnv', () => {
  it('applique les limites IGDB par défaut', () => {
    expect(loadIgdbEnv(creds)).toMatchObject({ IGDB_RPS: 4, IGDB_MAX_CONCURRENCY: 8 });
  });

  it('accepte des limites plus basses', () => {
    expect(loadIgdbEnv({ ...creds, IGDB_RPS: '3', IGDB_MAX_CONCURRENCY: '2' })).toMatchObject({
      IGDB_RPS: 3,
      IGDB_MAX_CONCURRENCY: 2,
    });
  });

  it('refuse de dépasser 4 req/s ou 8 requêtes en parallèle', () => {
    expect(() => loadIgdbEnv({ ...creds, IGDB_RPS: '5' })).toThrow();
    expect(() => loadIgdbEnv({ ...creds, IGDB_MAX_CONCURRENCY: '9' })).toThrow();
  });

  it('exige les identifiants Twitch', () => {
    expect(() => loadIgdbEnv({})).toThrow(/TWITCH_CLIENT_ID/);
  });
});
