/** Raretés Pixpedia, de la plus commune à la plus prestigieuse. */
export const RARITY_KEYS = ['starter', 'bonus', 'combo', 'boss', 'final', 'hof'] as const;
export type Rarity = (typeof RARITY_KEYS)[number];

export interface RarityInfo {
  key: Rarity;
  label: string;
  /** Couleur du cadre. `null` pour le Hall of Fame, rendu en dégradé holo. */
  color: string | null;
  /** Coût de la carte dans le budget d'équipe (spec §23.2). */
  cost: number;
}

export const RARITIES: Record<Rarity, RarityInfo> = {
  starter: { key: 'starter', label: 'Starter', color: '#8A93A6', cost: 1 },
  bonus: { key: 'bonus', label: 'Bonus', color: '#3FB27F', cost: 2 },
  combo: { key: 'combo', label: 'Combo', color: '#3D8BFF', cost: 3 },
  boss: { key: 'boss', label: 'Boss', color: '#A05CFF', cost: 4 },
  final: { key: 'final', label: 'Boss final', color: '#FF8A3D', cost: 5 },
  hof: { key: 'hof', label: 'Hall of Fame', color: null, cost: 6 },
};

export function rarityRank(rarity: Rarity): number {
  return RARITY_KEYS.indexOf(rarity);
}

export function maxRarity(a: Rarity, b: Rarity): Rarity {
  return rarityRank(a) >= rarityRank(b) ? a : b;
}

/** Familles de combat, déduites des genres IGDB. */
export const FAMILY_KEYS = ['action', 'strategie', 'vitesse', 'aventure', 'rpg'] as const;
export type Family = (typeof FAMILY_KEYS)[number];

export const FAMILY_LABELS: Record<Family, string> = {
  action: 'Action',
  strategie: 'Stratégie',
  vitesse: 'Vitesse',
  aventure: 'Aventure',
  rpg: 'RPG',
};

/** Cycle d'avantage : chaque famille bat la suivante. Action > Stratégie > Vitesse > Aventure > RPG > Action. */
export const FAMILY_BEATS: Record<Family, Family> = {
  action: 'strategie',
  strategie: 'vitesse',
  vitesse: 'aventure',
  aventure: 'rpg',
  rpg: 'action',
};

/** Bonus de dégâts de la famille avantagée (+20 %). */
export const FAMILY_ADVANTAGE_MULTIPLIER = 1.2;

/** Bornes des stats en percentile (spec §23.2). */
export const STAT_MIN = 10;
export const STAT_MAX = 99;

/** Valeurs par défaut quand la donnée IGDB manque (voir docs/decisions.md). */
export const STAT_DEFAULTS = {
  /** Jeu sans note : en général obscur, donc sous la médiane. */
  atkWithoutRating: 40,
  /** Jeu sans durée de jeu connue : neutre. */
  hpWithoutTimeToBeat: 50,
  spdWithoutTimeToBeat: 50,
} as const;

/** Statuts du catalogue (spec §4.3). */
export const GAME_STATUSES = ['eligible', 'quarantine', 'excluded'] as const;
export type GameStatus = (typeof GAME_STATUSES)[number];
