import { describe, expect, it, vi } from 'vitest';
import { HttpError, backoffDelay, isRetryable, parseRetryAfter, withRetry } from './retry';

const opts = {
  retries: 3,
  baseDelayMs: 100,
  maxDelayMs: 1000,
  sleep: vi.fn(async () => {}),
  random: () => 0,
};

describe('withRetry', () => {
  it('relance sur 429 avec backoff exponentiel', async () => {
    const sleep = vi.fn(async () => {});
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new HttpError(429, 'Too Many Requests'))
      .mockRejectedValueOnce(new HttpError(429, 'Too Many Requests'))
      .mockResolvedValue('ok');
    await expect(withRetry(fn, { ...opts, sleep })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls).toEqual([[100], [200]]);
  });

  it('respecte Retry-After quand le serveur le donne', async () => {
    const sleep = vi.fn(async () => {});
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new HttpError(429, '', 750))
      .mockResolvedValue('ok');
    await withRetry(fn, { ...opts, sleep });
    expect(sleep).toHaveBeenCalledWith(750);
  });

  it('abandonne après le nombre maximum de tentatives', async () => {
    const fn = vi.fn().mockRejectedValue(new HttpError(503, 'down'));
    await expect(withRetry(fn, opts)).rejects.toThrow('HTTP 503');
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it('ne relance pas une erreur non récupérable', async () => {
    const fn = vi.fn().mockRejectedValue(new HttpError(400, 'syntax error'));
    await expect(withRetry(fn, opts)).rejects.toThrow('HTTP 400');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('helpers', () => {
  it('isRetryable', () => {
    expect(isRetryable(new HttpError(429, ''))).toBe(true);
    expect(isRetryable(new HttpError(502, ''))).toBe(true);
    expect(isRetryable(new HttpError(401, ''))).toBe(false);
    expect(isRetryable(new TypeError('fetch failed'))).toBe(true);
    expect(isRetryable(new Error('autre'))).toBe(false);
  });

  it('backoffDelay plafonne et ajoute du jitter', () => {
    expect(backoffDelay(0, opts, () => 0)).toBe(100);
    expect(backoffDelay(3, opts, () => 0)).toBe(800);
    expect(backoffDelay(10, opts, () => 0)).toBe(1000);
    expect(backoffDelay(0, opts, () => 0.5)).toBe(150);
  });

  it('parseRetryAfter lit les secondes', () => {
    expect(parseRetryAfter('2')).toBe(2000);
    expect(parseRetryAfter(null)).toBeNull();
    expect(parseRetryAfter('n/a')).toBeNull();
  });
});
