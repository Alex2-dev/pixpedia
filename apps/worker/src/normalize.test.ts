import { describe, expect, it } from 'vitest';
import type { IgdbGame } from './igdb/types';
import { normalizeGame, type ReferenceData } from './normalize';

const refs: ReferenceData = {
  officialPlatformIds: new Set([6, 48]),
  knownPlatformIds: new Set([6, 48, 999]),
  knownGenreIds: new Set([12, 31]),
  themeSlugById: new Map([
    [1, 'action'],
    [42, 'erotic'],
  ]),
  blockedIds: new Set([666]),
};
const now = new Date('2026-10-12T00:00:00Z');

const minecraft: IgdbGame = {
  id: 121,
  name: 'Minecraft: Java Edition',
  slug: 'minecraft-java-edition',
  first_release_date: 1321574400, // 2011-11-18
  cover: { id: 1, image_id: 'co49x5' },
  game_type: 0,
  total_rating: 84.8,
  total_rating_count: 2035,
  platforms: [6, 999, 12345],
  genres: [31, 77],
  themes: [1],
  keywords: [{ id: 1, name: 'sandbox' }],
  age_ratings: [
    {
      id: 1,
      organization: { id: 1, name: 'ESRB' },
      rating_category: { id: 2, rating: 'E10' },
      rating_content_descriptions: [{ id: 3, description: 'Fantasy Violence' }],
    },
  ],
  involved_companies: [
    { id: 1, developer: false, company: { id: 1, name: 'Microsoft' } },
    { id: 2, developer: true, company: { id: 2, name: 'Mojang Studios' } },
  ],
  updated_at: 1760000000,
};

describe('normalizeGame', () => {
  it('extrait les champs du catalogue', () => {
    const r = normalizeGame(minecraft, refs, 3600 * 40.4, now);
    expect(r.row).toMatchObject({
      id: 121,
      releaseDecade: 2010,
      coverImageId: 'co49x5',
      totalRatingCount: 2035,
      timeToBeatSec: 145440,
      developerName: 'Mojang Studios',
      keywords: ['sandbox'],
      contentDescriptors: ['Fantasy Violence'],
      esrbAdultsOnly: false,
      status: 'eligible',
      statusReason: null,
      isDrawable: true,
    });
    expect(r.row.firstReleaseDate?.toISOString()).toBe('2011-11-18T00:00:00.000Z');
  });

  it('ne garde que les liaisons vers des références connues', () => {
    const r = normalizeGame(minecraft, refs, null, now);
    expect(r.platformIds).toEqual([6, 999]);
    expect(r.genreIds).toEqual([31]);
    expect(r.themeIds).toEqual([1]);
  });

  it('détecte ESRB Adults Only', () => {
    const r = normalizeGame(
      {
        ...minecraft,
        age_ratings: [
          {
            id: 9,
            organization: { id: 1, name: 'ESRB' },
            rating_category: { id: 1, rating: 'AO' },
          },
        ],
      },
      refs,
      null,
      now,
    );
    expect(r.row).toMatchObject({ esrbAdultsOnly: true, status: 'excluded', isDrawable: false });
  });

  it('exclut le thème Erotic, la liste noire et les plateformes hors liste blanche', () => {
    expect(normalizeGame({ ...minecraft, themes: [42] }, refs, null, now).row.statusReason).toBe(
      'content:erotic_theme',
    );
    expect(normalizeGame({ ...minecraft, id: 666 }, refs, null, now).row.statusReason).toBe(
      'content:blocked',
    );
    expect(
      normalizeGame({ ...minecraft, platforms: [999] }, refs, null, now).row.statusReason,
    ).toBe('inclusion:platform');
  });

  it('gère un jeu minimal sans données optionnelles', () => {
    const r = normalizeGame({ id: 5, name: 'X', slug: 'x' }, refs, 0, now);
    expect(r.row).toMatchObject({
      firstReleaseDate: null,
      releaseDecade: null,
      totalRating: null,
      totalRatingCount: 0,
      timeToBeatSec: null,
      developerName: null,
      status: 'excluded',
      statusReason: 'inclusion:game_type',
    });
  });
});
