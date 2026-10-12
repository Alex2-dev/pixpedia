import { describe, expect, it } from 'vitest';
import { gamesWhere } from './import';

describe('gamesWhere', () => {
  it('filtre l’import complet par id, type de jeu et jaquette', () => {
    expect(gamesWhere('full', 0, null)).toBe('where id > 0 & game_type = (0,8,9) & cover != null');
  });

  it('filtre la sync incrémentale sur updated_at', () => {
    expect(gamesWhere('incremental', 42, new Date('2026-10-01T00:00:00Z'))).toBe(
      'where updated_at > 1790812800 & id > 42',
    );
  });
});
