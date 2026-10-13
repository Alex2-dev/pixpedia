import type { CardView, Finish } from '@pixpedia/shared';
import type { CardData } from './types';

/** Champs propres à un exemplaire possédé ou tiré. */
export interface CopyInfo {
  finish?: Finish | string;
  isNew?: boolean;
  isBound?: boolean;
}

const FINISHES: readonly string[] = ['normal', 'holo', 'full_art'];

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
    // Une finition d'événement inconnue du design s'affiche comme normale.
    finish: v.finish && FINISHES.includes(v.finish) ? (v.finish as Finish) : 'normal',
    variant: 'normal',
  };
}
