import type { GameStatus } from './constants';

/**
 * Types de jeux IGDB retenus (`game_type`) : jeu principal, remake, remaster.
 * Portages, DLC, extensions, bundles, mods exclus (voir docs/decisions.md).
 */
export const INCLUDED_GAME_TYPES = [0, 8, 9] as const;

/** Mots-clés qui envoient un jeu en quarantaine (règle R3), cherchés en mots entiers. */
export const QUARANTINE_KEYWORDS = [
  'hentai',
  'eroge',
  'ero',
  'ecchi',
  'nsfw',
  '18+',
  'r18',
  'r-18',
  'porn',
  'porno',
  'pornographic',
  'xxx',
  'sex',
  'sexy',
  'erotic',
  'lewd',
  'nude',
  'nudity',
  'strip poker',
] as const;

/** Sous ce nombre de votes, un jeu est considéré peu populaire (règle R4). */
export const LOW_POPULARITY_VOTES = 10;

/** Données d'un jeu, déjà normalisées par le worker (noms résolus depuis les ids IGDB). */
export interface ClassifyInput {
  name: string;
  gameType: number | null;
  firstReleaseDate: Date | null;
  hasCover: boolean;
  /** Au moins une plateforme de la liste blanche. */
  hasOfficialPlatform: boolean;
  themeSlugs: readonly string[];
  keywords: readonly string[];
  /** Classification ESRB « Adults Only » présente. */
  esrbAdultsOnly: boolean;
  /** Descripteurs de contenu, en texte (ex. « Strong Sexual Content »). */
  contentDescriptors: readonly string[];
  votes: number;
  /** Présent dans `blocked_games`. */
  isBlocked: boolean;
}

export interface Classification {
  status: GameStatus;
  /** Raison lisible, `null` si éligible. Préfixe `content:` ou `inclusion:`. */
  reason: string | null;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const KEYWORD_RE = new RegExp(
  `(?<![\\p{L}\\p{N}])(${QUARANTINE_KEYWORDS.map(escapeRegExp).join('|')})(?![\\p{L}\\p{N}])`,
  'iu',
);

/** Premier mot-clé sensible trouvé dans `text`, en mot entier. */
export function findQuarantineKeyword(text: string): string | null {
  const m = KEYWORD_RE.exec(text.normalize('NFKC'));
  return m ? (m[1] as string).toLowerCase() : null;
}

/**
 * Décide si un jeu devient une carte (spec §3.3 et §4).
 * Ordre : exclusions de contenu (R5, R1, R2), puis critères d'inclusion, puis quarantaine (R3, R4).
 * Principe de prudence : en cas de doute, quarantaine.
 */
export function classifyGame(game: ClassifyInput, now: Date = new Date()): Classification {
  if (game.isBlocked) return { status: 'excluded', reason: 'content:blocked' };
  if (game.themeSlugs.includes('erotic'))
    return { status: 'excluded', reason: 'content:erotic_theme' };
  if (game.esrbAdultsOnly) return { status: 'excluded', reason: 'content:esrb_adults_only' };

  if (game.gameType === null || !(INCLUDED_GAME_TYPES as readonly number[]).includes(game.gameType))
    return { status: 'excluded', reason: 'inclusion:game_type' };
  if (!game.firstReleaseDate || game.firstReleaseDate.getTime() > now.getTime())
    return { status: 'excluded', reason: 'inclusion:unreleased' };
  if (!game.hasCover) return { status: 'excluded', reason: 'inclusion:no_cover' };
  if (!game.hasOfficialPlatform) return { status: 'excluded', reason: 'inclusion:platform' };

  const keyword =
    findQuarantineKeyword(game.name) ??
    game.keywords.map(findQuarantineKeyword).find((k) => k !== null) ??
    null;
  if (keyword) return { status: 'quarantine', reason: `content:keyword:${keyword}` };

  const strongSexual = game.contentDescriptors.some((d) => /strong sexual content/i.test(d));
  if (strongSexual && game.votes < LOW_POPULARITY_VOTES)
    return { status: 'quarantine', reason: 'content:strong_sexual_low_popularity' };

  return { status: 'eligible', reason: null };
}
