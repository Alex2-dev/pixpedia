import type { Family, Finish, Rarity } from '@pixpedia/shared';

export interface CardEvent {
  name: string;
  region: string;
  seed: number;
  index: number;
  total: number;
  steps: { label: string; done: boolean }[];
}

/** Données affichées par le composant carte (voir le tableau « variables » du design). */
export interface CardData {
  id: number;
  number: string;
  series: string;
  name: string;
  year: number | null;
  platform: string | null;
  family: Family | null;
  rarity: Rarity;
  cost: number;
  stats: { atk: number; def: number; pv: number; vit: number };
  cover: string | null;
  isNew?: boolean;
  isBound?: boolean;
  /** Finition tirée : reflet holo ou full art sur l'illustration. */
  finish?: Finish;
  /** Cadre doré VIP (prévu, pas encore attribué). */
  variant?: 'normal' | 'vip';
  /** Carte d'événement (prévue, pas encore attribuée). */
  event?: CardEvent;
}

export interface RarityStyle {
  label: string;
  color: string;
  /** Ciel haut, ciel bas, collines, soleil du paysage de remplacement. */
  scene: readonly [string, string, string, string];
  meta: string;
  /** Reflet qui balaie la carte : couleur, durée. */
  sh?: readonly [string, string];
}

export const RARITY_STYLE: Record<Rarity, RarityStyle> = {
  starter: {
    label: 'Starter',
    color: '#8A93A6',
    scene: ['#5B6478', '#2E3444', '#232836', '#C9CDD6'],
    meta: '#A79DB3',
  },
  bonus: {
    label: 'Bonus',
    color: '#3FB27F',
    scene: ['#3E7A66', '#1E3A33', '#163028', '#E7F6C9'],
    meta: '#8FCFB2',
    sh: ['rgba(255,255,255,.14)', '6s'],
  },
  combo: {
    label: 'Combo',
    color: '#3D8BFF',
    scene: ['#2D5BB8', '#17284F', '#0F1D3B', '#BFD7FF'],
    meta: '#8FB6FF',
    sh: ['rgba(160,200,255,.22)', '5s'],
  },
  boss: {
    label: 'Boss',
    color: '#A05CFF',
    scene: ['#4A2A7A', '#1A1030', '#120A22', '#FF5C7A'],
    meta: '#C9A8FF',
    sh: ['rgba(220,190,255,.28)', '4.5s'],
  },
  final: {
    label: 'Boss final',
    color: '#FF8A3D',
    scene: ['#7A2E12', '#2A120A', '#1A0A05', '#FFE08A'],
    meta: '#FFC48F',
    sh: ['rgba(255,220,160,.32)', '4s'],
  },
  hof: {
    label: 'Hall of Fame',
    color: '#FFD23F',
    scene: ['#3B2F7A', '#120E2A', '#0B0818', '#FFD23F'],
    meta: '#FFE9A8',
    sh: ['rgba(255,255,255,.45)', '3s'],
  },
};

export const FAMILY_TEXT: Record<Family, string> = {
  action: 'ACTION',
  strategie: 'STRATÉGIE',
  vitesse: 'VITESSE',
  aventure: 'AVENTURE',
  rpg: 'RPG',
};
