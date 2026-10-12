import { describe, expect, it } from 'vitest';
import { msUntilHour } from './schedule';

describe('msUntilHour', () => {
  it("vise l'heure du jour même si elle n'est pas passée", () => {
    expect(msUntilHour(4, new Date(2026, 9, 12, 2, 30))).toBe(90 * 60_000);
  });

  it('vise le lendemain si l’heure est passée', () => {
    expect(msUntilHour(4, new Date(2026, 9, 12, 4, 0))).toBe(24 * 3_600_000);
  });
});
