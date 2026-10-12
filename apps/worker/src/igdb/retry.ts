/** Erreur HTTP d'IGDB ou de Twitch. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
    /** Délai demandé par le serveur (`Retry-After`), en ms. */
    readonly retryAfterMs: number | null = null,
  ) {
    super(`HTTP ${status}: ${body.slice(0, 200)}`);
    this.name = 'HttpError';
  }
}

export function isRetryable(err: unknown): boolean {
  if (err instanceof HttpError) return err.status === 429 || err.status >= 500;
  // fetch lève une TypeError sur une erreur réseau (DNS, connexion coupée…).
  return err instanceof TypeError;
}

export function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(header);
  return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
}

export interface RetryOptions {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  onRetry?: (err: unknown, attempt: number, delayMs: number) => void;
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
}

export const DEFAULT_RETRY: RetryOptions = { retries: 6, baseDelayMs: 500, maxDelayMs: 30_000 };

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Délai avant la tentative `attempt` (0 = premier retry) : backoff exponentiel + jitter. */
export function backoffDelay(attempt: number, opts: RetryOptions, random = Math.random): number {
  const exp = Math.min(opts.maxDelayMs, opts.baseDelayMs * 2 ** attempt);
  return Math.round(exp + random() * opts.baseDelayMs);
}

/** Relance `fn` sur 429, 5xx et erreurs réseau. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = DEFAULT_RETRY,
): Promise<T> {
  const sleep = opts.sleep ?? defaultSleep;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= opts.retries || !isRetryable(err)) throw err;
      const serverDelay = err instanceof HttpError ? err.retryAfterMs : null;
      const delay = Math.min(
        opts.maxDelayMs,
        serverDelay ?? backoffDelay(attempt, opts, opts.random),
      );
      opts.onRetry?.(err, attempt + 1, delay);
      await sleep(delay);
    }
  }
}
