import { FAMILY_ADVANTAGE_MULTIPLIER, FAMILY_BEATS, type Family } from './constants';

/**
 * Correspondance genre IGDB (par slug, stable entre environnements) → famille.
 * Les genres absents (ex. « indie ») sont ignorés. Voir docs/decisions.md.
 */
export const GENRE_FAMILY: Readonly<Record<string, Family>> = {
  fighting: 'action',
  shooter: 'action',
  'hack-and-slash-beat-em-up': 'action',
  arcade: 'action',
  pinball: 'action',

  'real-time-strategy-rts': 'strategie',
  strategy: 'strategie',
  'turn-based-strategy-tbs': 'strategie',
  tactical: 'strategie',
  moba: 'strategie',
  'card-and-board-game': 'strategie',
  puzzle: 'strategie',
  'quiz-trivia': 'strategie',
  simulator: 'strategie',

  racing: 'vitesse',
  sport: 'vitesse',
  platform: 'vitesse',
  music: 'vitesse',

  adventure: 'aventure',
  'point-and-click': 'aventure',
  'visual-novel': 'aventure',

  'role-playing-rpg': 'rpg',
};

/** Ordre de départage quand deux familles ont autant de genres. */
const TIEBREAK: readonly Family[] = ['rpg', 'strategie', 'aventure', 'vitesse', 'action'];

export const DEFAULT_FAMILY: Family = 'action';

/**
 * Genres secondaires : ils ne comptent que si le jeu n'a aucun autre genre reconnu.
 * Le puzzle accompagne souvent l'aventure ou la plateforme (Zelda, Portal) sans en être le cœur.
 */
export const SECONDARY_GENRES: ReadonlySet<string> = new Set(['puzzle']);

/** Famille majoritaire parmi les genres du jeu, avec départage fixe, Action par défaut. */
export function familyFromGenres(genreSlugs: readonly string[]): Family {
  const primary = genreSlugs.filter((s) => GENRE_FAMILY[s] && !SECONDARY_GENRES.has(s));
  const counted = primary.length > 0 ? primary : genreSlugs;
  const counts = new Map<Family, number>();
  for (const slug of counted) {
    const family = GENRE_FAMILY[slug];
    if (family) counts.set(family, (counts.get(family) ?? 0) + 1);
  }
  let best: Family = DEFAULT_FAMILY;
  let bestCount = 0;
  for (const family of TIEBREAK) {
    const count = counts.get(family) ?? 0;
    if (count > bestCount) {
      best = family;
      bestCount = count;
    }
  }
  return best;
}

/** Multiplicateur de dégâts de `attacker` contre `defender` (1,2 si avantage, sinon 1). */
export function familyDamageMultiplier(attacker: Family, defender: Family): number {
  return FAMILY_BEATS[attacker] === defender ? FAMILY_ADVANTAGE_MULTIPLIER : 1;
}
