import { describe, expect, it, vi } from 'vitest';
import { IgdbClient } from './client';

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

function makeClient(handler: (url: string, init: RequestInit) => Response) {
  const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) =>
    handler(String(url), init ?? {}),
  );
  const client = new IgdbClient({
    clientId: 'cid',
    clientSecret: 'secret',
    requestsPerSecond: 100,
    maxConcurrent: 8,
    retry: { retries: 3, baseDelayMs: 1, maxDelayMs: 5 },
    fetchImpl: fetchImpl as unknown as typeof fetch,
  });
  return { client, fetchImpl };
}

const tokenOk = () =>
  jsonResponse({ access_token: 'tok', expires_in: 5_000_000, token_type: 'bearer' });

describe('IgdbClient', () => {
  it('obtient un token puis interroge IGDB avec les bons en-têtes', async () => {
    const { client, fetchImpl } = makeClient((url) =>
      url.includes('twitch') ? tokenOk() : jsonResponse([{ id: 1 }]),
    );
    await expect(client.query('games', 'fields id; limit 1;')).resolves.toEqual([{ id: 1 }]);
    const [url, init] = fetchImpl.mock.calls[1]!;
    expect(url).toBe('https://api.igdb.com/v4/games');
    expect(init?.headers).toMatchObject({ 'Client-ID': 'cid', Authorization: 'Bearer tok' });
    expect(init?.body).toBe('fields id; limit 1;');
  });

  it('met le token en cache entre les requêtes', async () => {
    const { client, fetchImpl } = makeClient((url) =>
      url.includes('twitch') ? tokenOk() : jsonResponse([]),
    );
    await Promise.all([
      client.query('games', 'a'),
      client.query('games', 'b'),
      client.query('games', 'c'),
    ]);
    const tokenCalls = fetchImpl.mock.calls.filter(([u]) => String(u).includes('twitch'));
    expect(tokenCalls).toHaveLength(1);
  });

  it('relance sur 429 et compte les limitations', async () => {
    let n = 0;
    const { client } = makeClient((url) => {
      if (url.includes('twitch')) return tokenOk();
      return n++ === 0 ? jsonResponse({}, 429) : jsonResponse([{ id: 2 }]);
    });
    await expect(client.query('games', 'x')).resolves.toEqual([{ id: 2 }]);
    expect(client.stats).toMatchObject({ requests: 2, retries: 1, rateLimited: 1 });
  });

  it('redemande un token sur 401', async () => {
    let tokens = 0;
    const { client } = makeClient((url, init) => {
      if (url.includes('twitch')) {
        tokens++;
        return jsonResponse({
          access_token: `tok${tokens}`,
          expires_in: 5_000_000,
          token_type: 'bearer',
        });
      }
      const auth = (init.headers as Record<string, string>).Authorization;
      return auth === 'Bearer tok1' ? jsonResponse({}, 401) : jsonResponse([{ ok: true }]);
    });
    await expect(client.query('games', 'x')).resolves.toEqual([{ ok: true }]);
    expect(tokens).toBe(2);
    expect(client.stats.tokenRefreshes).toBe(1);
  });

  it('remonte une erreur 400 sans la relancer', async () => {
    const { client } = makeClient((url) =>
      url.includes('twitch') ? tokenOk() : jsonResponse({ title: 'Syntax Error' }, 400),
    );
    await expect(client.query('games', 'bad')).rejects.toThrow('HTTP 400');
    expect(client.stats.requests).toBe(1);
  });
});
