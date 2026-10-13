import { z } from 'zod';
import { RARITY_KEYS, rarityRank, type Rarity } from './constants';

/** Cartes par pack (spec §5.4). */
export const PACK_SIZE = 5;

/** Probabilités d'un emplacement, en pourcentage par rareté (total = 100). */
export type SlotOdds = Partial<Record<Rarity, number>>;

/**
 * Taux de drop du pack standard (spec §5.4, raretés Pixpedia).
 * Stockés en base dans `pack_types.odds` : ces valeurs ne sont que celles de départ.
 */
export const DEFAULT_PACK_ODDS: SlotOdds[] = [
  { starter: 75, bonus: 22, combo: 3 },
  { starter: 75, bonus: 22, combo: 3 },
  { starter: 75, bonus: 22, combo: 3 },
  { bonus: 70, combo: 24, boss: 5, final: 1 },
  { combo: 70, boss: 22, final: 7, hof: 1 },
];

/** Garantie : après 10 packs sans Boss ou mieux, le dernier emplacement est Boss au minimum. */
export const PITY_THRESHOLD = 10;
export const PITY_MIN_RARITY: Rarity = 'boss';

const slotOddsSchema = z
  .partialRecord(z.enum(RARITY_KEYS), z.number().min(0).max(100))
  .refine((o) => Math.abs(Object.values(o).reduce((a, b) => a + (b ?? 0), 0) - 100) < 1e-9, {
    message: 'Le total des probabilités d’un emplacement doit faire 100 %',
  });

export const packOddsSchema = z.array(slotOddsSchema).length(PACK_SIZE);

/** Précision du tirage : les pourcentages sont convertis en dix-millièmes. */
const SCALE = 10_000;

/**
 * Tire une rareté pour un emplacement. `randomInt(max)` doit renvoyer un entier dans [0, max)
 * (côté serveur : `crypto.randomInt`, jamais `Math.random`, spec §8.4).
 */
export function rollRarity(odds: SlotOdds, randomInt: (max: number) => number): Rarity {
  const roll = randomInt(SCALE);
  let acc = 0;
  let last: Rarity = 'starter';
  for (const rarity of RARITY_KEYS) {
    const weight = Math.round((odds[rarity] ?? 0) * (SCALE / 100));
    if (weight <= 0) continue;
    acc += weight;
    last = rarity;
    if (roll < acc) return rarity;
  }
  return last;
}

/** Applique la garantie (pity) à la rareté tirée pour le dernier emplacement. */
export function applyPity(rarity: Rarity, pityCounter: number): Rarity {
  if (pityCounter < PITY_THRESHOLD) return rarity;
  return rarityRank(rarity) >= rarityRank(PITY_MIN_RARITY) ? rarity : PITY_MIN_RARITY;
}

/** Rareté inférieure, quand le pool d'une rareté est vide (spec §8.3 c). `null` sous Starter. */
export function lowerRarity(rarity: Rarity): Rarity | null {
  const rank = rarityRank(rarity);
  return rank > 0 ? (RARITY_KEYS[rank - 1] as Rarity) : null;
}

/** Ce pack compte-t-il pour remettre la garantie à zéro (une carte Boss ou mieux) ? */
export function resetsPity(rarities: readonly Rarity[]): boolean {
  return rarities.some((r) => rarityRank(r) >= rarityRank(PITY_MIN_RARITY));
}
