import { describe, expect, it } from 'vitest';
import { computePackStock, rollFinish } from './player';

const MIN = 60_000;
const opts = { max: 10, regenMs: 5 * MIN };
const t0 = new Date('2026-10-13T10:00:00Z');
const at = (minutes: number) => new Date(t0.getTime() + minutes * MIN);

describe('computePackStock (recharge paresseuse, spec §8.2)', () => {
  it('ne change rien avant 5 minutes', () => {
    expect(computePackStock({ available: 3, updatedAt: t0 }, at(4), opts)).toEqual({
      available: 3,
      updatedAt: t0,
      nextPackAt: at(5),
    });
  });

  it('ajoute un pack toutes les 5 minutes et garde le reste du temps écoulé', () => {
    expect(computePackStock({ available: 3, updatedAt: t0 }, at(12), opts)).toEqual({
      available: 5,
      updatedAt: at(10),
      nextPackAt: at(15),
    });
  });

  it('plafonne à 10 et ne programme plus de recharge', () => {
    expect(computePackStock({ available: 8, updatedAt: t0 }, at(600), opts)).toEqual({
      available: 10,
      updatedAt: at(600),
      nextPackAt: null,
    });
  });

  it('un stock déjà plein reste plein', () => {
    expect(computePackStock({ available: 10, updatedAt: t0 }, at(1), opts).nextPackAt).toBeNull();
  });
});

describe('rollFinish (holo 1/20, full art 1/200)', () => {
  it('respecte les probabilités sur toutes les valeurs possibles', () => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < 200; i++) {
      const f = rollFinish(() => i);
      counts[f] = (counts[f] ?? 0) + 1;
    }
    expect(counts).toEqual({ full_art: 1, holo: 10, normal: 189 });
  });

  it('demande un entier dans [0, 200)', () => {
    const maxes: number[] = [];
    rollFinish((m) => {
      maxes.push(m);
      return 199;
    });
    expect(maxes).toEqual([200]);
  });
});
