import { describe, expect, it, vi } from 'vitest';
import type { Db } from '@pixpedia/db';
import { buildApp } from './app';
import { escapeLike, toGameDto, type GameSearchRow } from './games';

function fakeDb(execute: () => Promise<unknown>): Db {
  return { execute: vi.fn(execute) } as unknown as Db;
}

describe('GET /health', () => {
  it('renvoie ok quand la base répond', async () => {
    const app = await buildApp({ db: fakeDb(async () => ({ rows: [] })) });
    const res = await app.inject('/health');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok', db: 'ok' });
  });

  it('renvoie 503 quand la base est injoignable', async () => {
    const app = await buildApp({
      db: fakeDb(async () => {
        throw new Error('down');
      }),
    });
    const res = await app.inject('/health');
    expect(res.statusCode).toBe(503);
  });
});

describe('GET /games', () => {
  it.each(['/games', '/games?search=z', '/games?search=zelda&limit=500'])(
    'refuse une requête invalide : %s',
    async (url) => {
      const db = fakeDb(async () => ({ rows: [] }));
      const app = await buildApp({ db });
      const res = await app.inject(url);
      expect(res.statusCode).toBe(400);
      expect(db.execute).not.toHaveBeenCalled();
    },
  );
});

describe('toGameDto', () => {
  const row: GameSearchRow = {
    id: 1025,
    name: 'The Legend of Zelda: Ocarina of Time',
    slug: 'the-legend-of-zelda-ocarina-of-time',
    first_release_date: '1998-11-21',
    cover_image_id: 'co3nnx',
    developer_name: 'Nintendo EAD',
    total_rating: 91.234,
    total_rating_count: 1500,
    card_id: 7,
    series_code: 'S0',
    rarity: 'hof',
    family: 'aventure',
    atk: 97,
    def: 95,
    hp: 60,
    spd: 59,
    score_at_print: 287.456,
  };

  it('expose rareté, coût, famille et stats', () => {
    const dto = toGameDto(row);
    expect(dto.releaseYear).toBe(1998);
    expect(dto.coverUrl).toBe('https://images.igdb.com/igdb/image/upload/t_cover_big/co3nnx.jpg');
    expect(dto.totalRating).toBe(91.2);
    expect(dto.card).toMatchObject({
      rarity: 'hof',
      rarityLabel: 'Hall of Fame',
      cost: 6,
      familyLabel: 'Aventure',
      atk: 97,
      scoreAtPrint: 287.5,
    });
  });

  it('renvoie card = null pour un jeu sans carte', () => {
    expect(toGameDto({ ...row, card_id: null, rarity: null, family: null }).card).toBeNull();
  });
});

describe('escapeLike', () => {
  it('neutralise les jokers', () => {
    expect(escapeLike('100%_a\\b')).toBe('100\\%\\_a\\\\b');
  });
});
