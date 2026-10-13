import { sql } from 'drizzle-orm';
import {
  boolean,
  char,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  serial,
  smallint,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import type { RarityParams, SlotOdds } from '@pixpedia/shared';

const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

/* ---------- Catalogue (spec §7) ---------- */

export const platforms = pgTable('platforms', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  abbreviation: text('abbreviation'),
  /** pc | playstation | xbox | nintendo | sega | mobile | retro, `null` hors liste blanche. */
  family: text('family'),
  isOfficial: boolean('is_official').notNull().default(false),
});

export const genres = pgTable('genres', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
});

export const themes = pgTable('themes', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
});

export const games = pgTable(
  'games',
  {
    /** id IGDB */
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    summary: text('summary'),
    firstReleaseDate: date('first_release_date', { mode: 'date' }),
    releaseDecade: smallint('release_decade'),
    coverImageId: text('cover_image_id'),
    gameType: smallint('game_type'),
    totalRating: real('total_rating'),
    totalRatingCount: integer('total_rating_count').notNull().default(0),
    timeToBeatSec: integer('time_to_beat_sec'),
    developerName: text('developer_name'),
    /** Données brutes gardées pour reclasser un jeu sans rappeler IGDB. */
    keywords: text('keywords')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    contentDescriptors: text('content_descriptors')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    esrbAdultsOnly: boolean('esrb_adults_only').notNull().default(false),
    /** Cote : score recalculé chaque semaine, sans effet sur la rareté. */
    prestigeScore: real('prestige_score'),
    status: text('status').notNull().default('eligible'),
    statusReason: text('status_reason'),
    isDrawable: boolean('is_drawable').notNull().default(true),
    igdbUpdatedAt: timestamptz('igdb_updated_at'),
    syncedAt: timestamptz('synced_at').notNull().defaultNow(),
  },
  (t) => [
    check('games_status_check', sql`${t.status} in ('eligible', 'quarantine', 'excluded')`),
    index('games_status_idx').on(t.status),
    index('games_igdb_updated_at_idx').on(t.igdbUpdatedAt),
    index('games_name_trgm_idx').using('gin', sql`${t.name} gin_trgm_ops`),
  ],
);

export const gamePlatforms = pgTable(
  'game_platforms',
  {
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    platformId: integer('platform_id')
      .notNull()
      .references(() => platforms.id),
  },
  (t) => [primaryKey({ columns: [t.gameId, t.platformId] })],
);

export const gameGenres = pgTable(
  'game_genres',
  {
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    genreId: integer('genre_id')
      .notNull()
      .references(() => genres.id),
  },
  (t) => [primaryKey({ columns: [t.gameId, t.genreId] })],
);

export const gameThemes = pgTable(
  'game_themes',
  {
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    themeId: integer('theme_id')
      .notNull()
      .references(() => themes.id),
  },
  (t) => [primaryKey({ columns: [t.gameId, t.themeId] })],
);

/* ---------- Modération (spec §4.4) ---------- */

/** Liste noire versionnée : survit aux réimports. Pas de FK, un jeu peut être bloqué avant import. */
export const blockedGames = pgTable('blocked_games', {
  gameId: integer('game_id').primaryKey(),
  reason: text('reason').notNull(),
  createdBy: integer('created_by'),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
});

/* ---------- Séries et cartes (spec §7.1, raretés Pixpedia) ---------- */

export const series = pgTable('series', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  rarityParams: jsonb('rarity_params').$type<RarityParams>().notNull(),
  /** `null` = brouillon recalculable. Une fois publiée, raretés et stats sont figées. */
  releasedAt: timestamptz('released_at'),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
});

const rarityCheck = (col: unknown) =>
  sql`${col} in ('starter', 'bonus', 'combo', 'boss', 'final', 'hof')`;

export const cards = pgTable(
  'cards',
  {
    id: serial('id').primaryKey(),
    seriesId: integer('series_id')
      .notNull()
      .references(() => series.id),
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id),
    /** Figée à la création de la carte. */
    rarity: text('rarity').notNull(),
    scoreAtPrint: real('score_at_print').notNull(),
    /** Stats figées, percentiles 10–99. */
    atk: smallint('atk').notNull(),
    def: smallint('def').notNull(),
    hp: smallint('hp').notNull(),
    spd: smallint('spd').notNull(),
    family: text('family').notNull(),
    /** Réservé au futur système de combat, pas encore tranché. */
    combat: jsonb('combat').notNull().default({}),
    createdAt: timestamptz('created_at').notNull().defaultNow(),
  },
  (t) => [
    unique('cards_series_game_unique').on(t.seriesId, t.gameId),
    check('cards_rarity_check', rarityCheck(t.rarity)),
    check(
      'cards_family_check',
      sql`${t.family} in ('action', 'strategie', 'vitesse', 'aventure', 'rpg')`,
    ),
    check(
      'cards_stats_check',
      sql`${t.atk} between 10 and 99 and ${t.def} between 10 and 99 and ${t.hp} between 10 and 99 and ${t.spd} between 10 and 99`,
    ),
    index('cards_game_idx').on(t.gameId),
  ],
);

export const rarityOverrides = pgTable(
  'rarity_overrides',
  {
    gameId: integer('game_id')
      .primaryKey()
      .references(() => games.id),
    minRarity: text('min_rarity').notNull(),
    reason: text('reason').notNull(),
  },
  (t) => [check('rarity_overrides_rarity_check', rarityCheck(t.minRarity))],
);

/* ---------- Packs et tirage (spec §5.4, §8) ---------- */

export const packTypes = pgTable('pack_types', {
  id: serial('id').primaryKey(),
  /** standard, n64, rpg, 1990s… */
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  /** Filtre sur le pool de tirage, `{}` pour le pack standard (packs thématiques en phase 5). */
  filter: jsonb('filter').notNull().default({}),
  /** Coût en éclats, 0 = pack rechargeable gratuit. */
  cost: integer('cost').notNull().default(0),
  /** Probabilités par emplacement : modifiables sans toucher au code, publiées dans le jeu. */
  odds: jsonb('odds').$type<SlotOdds[]>().notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

/** Index dense par rareté : un tirage = une lecture par clé primaire (spec §8.1). Reconstruit après chaque sync. */
export const drawPool = pgTable(
  'draw_pool',
  {
    packTypeId: integer('pack_type_id')
      .notNull()
      .references(() => packTypes.id),
    rarity: text('rarity').notNull(),
    /** 1..n, sans trou */
    idx: integer('idx').notNull(),
    cardId: integer('card_id')
      .notNull()
      .references(() => cards.id),
  },
  (t) => [
    primaryKey({ columns: [t.packTypeId, t.rarity, t.idx] }),
    // Sans cet index, recalculer une série vérifie la clé étrangère en parcourant tout le pool.
    index('draw_pool_card_idx').on(t.cardId),
  ],
);

export const drawPoolCounts = pgTable(
  'draw_pool_counts',
  {
    packTypeId: integer('pack_type_id')
      .notNull()
      .references(() => packTypes.id),
    rarity: text('rarity').notNull(),
    n: integer('n').notNull(),
  },
  (t) => [primaryKey({ columns: [t.packTypeId, t.rarity] })],
);

/* ---------- Suivi des imports ---------- */

export const syncRuns = pgTable('sync_runs', {
  id: serial('id').primaryKey(),
  /** full | incremental | series */
  kind: text('kind').notNull(),
  startedAt: timestamptz('started_at').notNull().defaultNow(),
  finishedAt: timestamptz('finished_at'),
  added: integer('added').notNull().default(0),
  updated: integer('updated').notNull().default(0),
  excluded: integer('excluded').notNull().default(0),
  quarantined: integer('quarantined').notNull().default(0),
  error: text('error'),
  report: jsonb('report'),
});

/* ---------- Pays et fonctions payantes (spec §17.9) ---------- */

/** Vide pour l'instant : aucun paiement n'est actif. 'ZZ' = réglage par défaut. */
export const countryFeatures = pgTable('country_features', {
  countryCode: char('country_code', { length: 2 }).primaryKey(),
  canSubscribe: boolean('can_subscribe').notNull().default(false),
  canBuyCoins: boolean('can_buy_coins').notNull().default(false),
  canUseMarket: boolean('can_use_market').notNull().default(true),
  canEarnCoins: boolean('can_earn_coins').notNull().default(true),
});
