import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RateLimiter } from './rate-limiter';

beforeEach(() => vi.useFakeTimers({ now: 0 }));
afterEach(() => vi.useRealTimers());

describe('RateLimiter', () => {
  it('ne démarre pas plus de 4 requêtes par seconde', async () => {
    const limiter = new RateLimiter({ requestsPerSecond: 4, maxConcurrent: 8 });
    const startedAt: number[] = [];
    const tasks = Array.from({ length: 12 }, () =>
      limiter.schedule(async () => {
        startedAt.push(Date.now());
      }),
    );
    await vi.advanceTimersByTimeAsync(3000);
    await Promise.all(tasks);
    expect(startedAt).toEqual([0, 0, 0, 0, 1000, 1000, 1000, 1000, 2000, 2000, 2000, 2000]);
  });

  it('respecte la fenêtre glissante sur toute seconde', async () => {
    const limiter = new RateLimiter({ requestsPerSecond: 4, maxConcurrent: 8 });
    const startedAt: number[] = [];
    const run = () =>
      limiter.schedule(async () => {
        startedAt.push(Date.now());
      });
    const tasks = [run(), run()];
    await vi.advanceTimersByTimeAsync(600);
    tasks.push(run(), run(), run(), run(), run());
    await vi.advanceTimersByTimeAsync(3000);
    await Promise.all(tasks);
    for (const t of startedAt) {
      expect(startedAt.filter((s) => s > t - 1000 && s <= t).length).toBeLessThanOrEqual(4);
    }
    expect(startedAt).toHaveLength(7);
  });

  it('ne dépasse jamais 8 requêtes en parallèle', async () => {
    const limiter = new RateLimiter({ requestsPerSecond: 100, maxConcurrent: 8 });
    let inFlight = 0;
    let peak = 0;
    const tasks = Array.from({ length: 30 }, () =>
      limiter.schedule(async () => {
        inFlight++;
        peak = Math.max(peak, inFlight);
        await new Promise((r) => setTimeout(r, 500));
        inFlight--;
      }),
    );
    await vi.advanceTimersByTimeAsync(5000);
    await Promise.all(tasks);
    expect(peak).toBe(8);
  });

  it('propage les erreurs et libère la place', async () => {
    const limiter = new RateLimiter({ requestsPerSecond: 10, maxConcurrent: 1 });
    const failing = limiter.schedule(async () => {
      throw new Error('boom');
    });
    await expect(failing).rejects.toThrow('boom');
    await expect(limiter.schedule(async () => 42)).resolves.toBe(42);
  });
});
