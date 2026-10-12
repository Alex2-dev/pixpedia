export interface RateLimiterOptions {
  /** Démarrages maximum par fenêtre glissante d'une seconde. */
  requestsPerSecond: number;
  /** Requêtes en cours maximum. */
  maxConcurrent: number;
}

/**
 * File d'attente qui respecte à la fois un débit (fenêtre glissante d'1 s)
 * et un nombre maximum de requêtes en parallèle.
 */
export class RateLimiter {
  private readonly starts: number[] = [];
  private readonly queue: (() => void)[] = [];
  private inFlight = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly opts: RateLimiterOptions) {
    if (opts.requestsPerSecond <= 0 || opts.maxConcurrent <= 0) {
      throw new Error('RateLimiter : limites strictement positives attendues');
    }
  }

  schedule<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(() => {
        this.inFlight++;
        this.starts.push(Date.now());
        task()
          .then(resolve, reject)
          .finally(() => {
            this.inFlight--;
            this.pump();
          });
      });
      this.pump();
    });
  }

  get pending(): number {
    return this.queue.length;
  }

  private pump(): void {
    while (this.queue.length > 0) {
      if (this.inFlight >= this.opts.maxConcurrent) return;
      const now = Date.now();
      while (this.starts.length > 0 && (this.starts[0] as number) <= now - 1000)
        this.starts.shift();
      if (this.starts.length >= this.opts.requestsPerSecond) {
        if (!this.timer) {
          const wait = (this.starts[0] as number) + 1000 - now;
          this.timer = setTimeout(() => {
            this.timer = null;
            this.pump();
          }, wait);
        }
        return;
      }
      this.queue.shift()?.();
    }
  }
}
