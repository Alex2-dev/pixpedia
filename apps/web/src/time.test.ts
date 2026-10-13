import { describe, expect, it } from 'vitest';
import { formatCountdown } from './time';

const now = new Date('2026-10-13T12:00:00Z');
const plus = (ms: number) => new Date(now.getTime() + ms);

describe('formatCountdown', () => {
  it('affiche minutes et secondes, arrondies à la seconde supérieure', () => {
    expect(formatCountdown(plus(4 * 60_000 + 7_000), now)).toBe('4:07');
    expect(formatCountdown(plus(500), now)).toBe('0:01');
  });

  it('renvoie null une fois l’heure atteinte', () => {
    expect(formatCountdown(now, now)).toBeNull();
    expect(formatCountdown(plus(-1), now)).toBeNull();
  });
});
