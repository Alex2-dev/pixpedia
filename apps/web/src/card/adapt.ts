import { normalizeFinish, type CardView, type Finish } from '@pixpedia/shared';
import type { CardData } from './types';

/** Champs propres à un exemplaire possédé ou tiré. */
export interface CopyInfo {
  finish?: Finish | string;
  isNew?: boolean;
  isBound?: boolean;
}

/** Convertit la vue carte de l'API vers les données du composant (PV = hp, VIT = spd). */
export function toCardData(v: CardView & CopyInfo): CardData {
  return {
    id: v.cardId,
    number: v.number,
    series: v.seriesCode,
    name: v.name,
    year: v.year,
    platform: v.platform,
    family: v.family,
    rarity: v.rarity,
    cost: v.cost,
    stats: { atk: v.atk, def: v.def, pv: v.hp, vit: v.spd },
    cover: v.coverUrl,
    isNew: v.isNew ?? false,
    isBound: v.isBound ?? false,
    // Ancien nom « full_art » lu comme « fullart » ; une finition inconnue s'affiche normale.
    finish: normalizeFinish(v.finish),
    variant: 'normal',
  };
}
