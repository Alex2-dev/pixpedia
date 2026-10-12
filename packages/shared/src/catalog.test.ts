import { describe, expect, it } from 'vitest';
import { classifyGame, findQuarantineKeyword, type ClassifyInput } from './catalog';

const now = new Date('2026-10-12T00:00:00Z');
const base: ClassifyInput = {
  name: 'The Witcher 3: Wild Hunt',
  gameType: 0,
  firstReleaseDate: new Date('2015-05-19T00:00:00Z'),
  hasCover: true,
  hasOfficialPlatform: true,
  themeSlugs: ['action', 'fantasy'],
  keywords: ['open world'],
  esrbAdultsOnly: false,
  contentDescriptors: ['Blood and Gore', 'Nudity', 'Strong Sexual Content'],
  votes: 3000,
  isBlocked: false,
};
const classify = (patch: Partial<ClassifyInput>) => classifyGame({ ...base, ...patch }, now);

describe('classifyGame : jeux conservés', () => {
  it('garde un jeu grand public avec du contenu sexuel (spec §4.1)', () => {
    expect(classify({})).toEqual({ status: 'eligible', reason: null });
  });

  it('accepte remakes et remasters', () => {
    expect(classify({ gameType: 8 }).status).toBe('eligible');
    expect(classify({ gameType: 9 }).status).toBe('eligible');
  });
});

describe('classifyGame : exclusions de contenu', () => {
  it('R1 thème Erotic', () => {
    expect(classify({ themeSlugs: ['erotic'] })).toEqual({
      status: 'excluded',
      reason: 'content:erotic_theme',
    });
  });

  it('R2 ESRB Adults Only', () => {
    expect(classify({ esrbAdultsOnly: true }).reason).toBe('content:esrb_adults_only');
  });

  it('R5 liste noire, prioritaire sur tout le reste', () => {
    expect(classify({ isBlocked: true, hasCover: false }).reason).toBe('content:blocked');
  });
});

describe('classifyGame : quarantaine', () => {
  it('R3 mot-clé dans le nom', () => {
    expect(classify({ name: 'Super Hentai Puzzle' })).toEqual({
      status: 'quarantine',
      reason: 'content:keyword:hentai',
    });
  });

  it('R3 mot-clé explicite dans les keywords IGDB', () => {
    expect(classify({ keywords: ['NSFW'] }).reason).toBe('content:keyword:nsfw');
    expect(classify({ keywords: ['hentai'] }).reason).toBe('content:keyword:hentai');
  });

  it('R3 ignore les tags descriptifs des jeux grand public (BioShock, Mass Effect 2…)', () => {
    expect(classify({ keywords: ['sex work', 'nudity', 'sexy outfits', 'nude'] }).status).toBe(
      'eligible',
    );
  });

  it('R3 garde la liste complète pour le nom du jeu', () => {
    expect(classify({ name: 'Sexy Beach Zero' }).reason).toBe('content:keyword:sexy');
  });

  it('R4 contenu sexuel fort et faible popularité', () => {
    expect(classify({ votes: 3 }).reason).toBe('content:strong_sexual_low_popularity');
  });

  it('R4 ne touche pas un jeu populaire', () => {
    expect(classify({ votes: 10 }).status).toBe('eligible');
  });
});

describe("classifyGame : critères d'inclusion", () => {
  it.each([
    [{ gameType: 1 }, 'inclusion:game_type'],
    [{ gameType: 11 }, 'inclusion:game_type'],
    [{ gameType: null }, 'inclusion:game_type'],
    [{ firstReleaseDate: null }, 'inclusion:unreleased'],
    [{ firstReleaseDate: new Date('2027-01-01T00:00:00Z') }, 'inclusion:unreleased'],
    [{ hasCover: false }, 'inclusion:no_cover'],
    [{ hasOfficialPlatform: false }, 'inclusion:platform'],
  ] as const)('%o → %s', (patch, reason) => {
    expect(classify(patch)).toEqual({ status: 'excluded', reason });
  });

  it("l'exclusion de contenu passe avant l'inclusion", () => {
    expect(classify({ themeSlugs: ['erotic'], hasCover: false }).reason).toBe(
      'content:erotic_theme',
    );
  });
});

describe('findQuarantineKeyword', () => {
  it('cherche en mots entiers, sans faux positifs', () => {
    expect(findQuarantineKeyword('Hero Quest')).toBeNull();
    expect(findQuarantineKeyword('Essex Adventures')).toBeNull();
    expect(findQuarantineKeyword('Sussex Pornstar Tycoon')).toBeNull();
    expect(findQuarantineKeyword('Pornstar')).toBeNull();
  });

  it('trouve les termes avec ponctuation et casse variée', () => {
    expect(findQuarantineKeyword('Dating Sim 18+')).toBe('18+');
    expect(findQuarantineKeyword('ECCHI Volleyball')).toBe('ecchi');
    expect(findQuarantineKeyword('Strip Poker Night')).toBe('strip poker');
    expect(findQuarantineKeyword('r18 edition')).toBe('r18');
  });
});
