import { describe, expect, it } from 'vitest';
import { FAMILY_BEATS, FAMILY_KEYS, type Family } from './constants';
import { familyDamageMultiplier, familyFromGenres } from './family';

describe('familyFromGenres', () => {
  it('associe un genre simple', () => {
    expect(familyFromGenres(['shooter'])).toBe('action');
    expect(familyFromGenres(['racing'])).toBe('vitesse');
    expect(familyFromGenres(['role-playing-rpg'])).toBe('rpg');
  });

  it('prend la famille majoritaire', () => {
    expect(familyFromGenres(['shooter', 'fighting', 'role-playing-rpg'])).toBe('action');
  });

  it('départage les égalités : RPG > Stratégie > Aventure > Vitesse > Action', () => {
    expect(familyFromGenres(['adventure', 'role-playing-rpg'])).toBe('rpg');
    expect(familyFromGenres(['shooter', 'adventure'])).toBe('aventure');
    expect(familyFromGenres(['platform', 'puzzle'])).toBe('strategie');
  });

  it('ignore les genres inconnus et retombe sur Action', () => {
    expect(familyFromGenres(['indie'])).toBe('action');
    expect(familyFromGenres([])).toBe('action');
    expect(familyFromGenres(['indie', 'adventure'])).toBe('aventure');
  });
});

describe("cycle d'avantage", () => {
  it('forme un cycle qui passe par les cinq familles', () => {
    const seen = new Set<string>();
    let f: Family = FAMILY_KEYS[0];
    for (let i = 0; i < FAMILY_KEYS.length; i++) {
      seen.add(f);
      f = FAMILY_BEATS[f];
    }
    expect(seen.size).toBe(5);
    expect(f).toBe(FAMILY_KEYS[0]);
  });

  it('Action > Stratégie > Vitesse > Aventure > RPG > Action', () => {
    expect(familyDamageMultiplier('action', 'strategie')).toBe(1.2);
    expect(familyDamageMultiplier('strategie', 'vitesse')).toBe(1.2);
    expect(familyDamageMultiplier('vitesse', 'aventure')).toBe(1.2);
    expect(familyDamageMultiplier('aventure', 'rpg')).toBe(1.2);
    expect(familyDamageMultiplier('rpg', 'action')).toBe(1.2);
  });

  it("pas de bonus sans avantage, ni dans l'autre sens", () => {
    expect(familyDamageMultiplier('strategie', 'action')).toBe(1);
    expect(familyDamageMultiplier('action', 'action')).toBe(1);
    expect(familyDamageMultiplier('action', 'vitesse')).toBe(1);
  });
});
