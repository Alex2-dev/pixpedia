import { RateLimiter } from './rate-limiter';
import { DEFAULT_RETRY, HttpError, parseRetryAfter, withRetry, type RetryOptions } from './retry';
import { TwitchTokenProvider } from './twitch-auth';

const BASE_URL = 'https://api.igdb.com/v4';

export interface IgdbClientOptions {
  clientId: string;
  clientSecret: string;
  requestsPerSecond: number;
  maxConcurrent: number;
  retry?: RetryOptions;
  fetchImpl?: typeof fetch;
  log?: (msg: string) => void;
}

export interface IgdbStats {
  requests: number;
  retries: number;
  rateLimited: number;
  tokenRefreshes: number;
}

/** Client IGDB : limite de débit, retry/backoff sur 429 et 5xx, token renouvelé sur 401. */
export class IgdbClient {
  readonly stats: IgdbStats = { requests: 0, retries: 0, rateLimited: 0, tokenRefreshes: 0 };
  private readonly limiter: RateLimiter;
  private readonly auth: TwitchTokenProvider;
  private readonly fetchImpl: typeof fetch;
  private readonly retry: RetryOptions;

  constructor(private readonly opts: IgdbClientOptions) {
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.limiter = new RateLimiter({
      requestsPerSecond: opts.requestsPerSecond,
      maxConcurrent: opts.maxConcurrent,
    });
    this.auth = new TwitchTokenProvider(opts.clientId, opts.clientSecret, this.fetchImpl);
    this.retry = {
      ...(opts.retry ?? DEFAULT_RETRY),
      onRetry: (err, attempt, delay) => {
        this.stats.retries++;
        if (err instanceof HttpError && err.status === 429) this.stats.rateLimited++;
        opts.log?.(`IGDB : nouvel essai n°${attempt} dans ${delay} ms (${String(err)})`);
      },
    };
  }

  /** Envoie une requête APICalypse à `endpoint` (ex. `games`). */
  async query<T>(endpoint: string, body: string): Promise<T[]> {
    let refreshed = false;
    return withRetry(async () => {
      try {
        return await this.limiter.schedule(() => this.send<T>(endpoint, body));
      } catch (err) {
        // Token expiré ou révoqué : on en redemande un, une seule fois.
        if (err instanceof HttpError && err.status === 401 && !refreshed) {
          refreshed = true;
          this.auth.invalidate();
          this.stats.tokenRefreshes++;
          return this.limiter.schedule(() => this.send<T>(endpoint, body));
        }
        throw err;
      }
    }, this.retry);
  }

  private async send<T>(endpoint: string, body: string): Promise<T[]> {
    const token = await this.auth.getToken();
    this.stats.requests++;
    const res = await this.fetchImpl(`${BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Client-ID': this.opts.clientId,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'text/plain',
      },
      body,
    });
    if (!res.ok) {
      throw new HttpError(
        res.status,
        await res.text(),
        parseRetryAfter(res.headers.get('retry-after')),
      );
    }
    return (await res.json()) as T[];
  }
}
