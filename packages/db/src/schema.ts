import { sql } from 'drizzle-orm';
import {
  bigint,
  bigserial,
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
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import type { FinishOdds, RarityParams, SlotOdds } from '@pixpedia/shared';

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

/** Sociétés IGDB (développeurs et éditeurs). */
export const companies = pgTable('companies', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
});

export const gameCompanies = pgTable(
  'game_companies',
  {
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    companyId: integer('company_id')
      .notNull()
      .references(() => companies.id),
    /** developer | publisher */
    role: text('role').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.gameId, t.companyId, t.role] }),
    check('game_companies_role_check', sql`${t.role} in ('developer', 'publisher')`),
    index('game_companies_company_idx').on(t.companyId),
  ],
);

/** Franchises IGDB (Zelda, Final Fantasy…). */
export const franchises = pgTable('franchises', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
});

export const gameFranchises = pgTable(
  'game_franchises',
  {
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    franchiseId: integer('franchise_id')
      .notNull()
      .references(() => franchises.id),
  },
  (t) => [
    primaryKey({ columns: [t.gameId, t.franchiseId] }),
    index('game_franchises_franchise_idx').on(t.franchiseId),
  ],
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
    /** Numéro dans la série (#0001…), par id IGDB croissant. Figé une fois la série publiée. */
    number: integer('number').notNull().default(0),
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

/* ---------- Sets : progression de collection (spec §5.7) ---------- */

/**
 * Sets d'une série : plateforme, décennie, année, genre, thème, développeur, éditeur, franchise.
 * Reconstruits avec la série, dans la même transaction que le pool de tirage.
 */
export const sets = pgTable(
  'sets',
  {
    id: serial('id').primaryKey(),
    seriesId: integer('series_id')
      .notNull()
      .references(() => series.id),
    type: text('type').notNull(),
    /** Identifiant stable dans le type : slug IGDB, décennie (« 1990 ») ou année. */
    key: text('key').notNull(),
    name: text('name').notNull(),
    total: integer('total').notNull(),
  },
  (t) => [
    unique('sets_series_type_key_unique').on(t.seriesId, t.type, t.key),
    index('sets_type_idx').on(t.seriesId, t.type, t.total),
  ],
);

export const setCards = pgTable(
  'set_cards',
  {
    setId: integer('set_id')
      .notNull()
      .references(() => sets.id, { onDelete: 'cascade' }),
    cardId: integer('card_id')
      .notNull()
      .references(() => cards.id),
  },
  (t) => [primaryKey({ columns: [t.setId, t.cardId] }), index('set_cards_card_idx').on(t.cardId)],
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
  /** Taux de finition par carte (holo, full art), publiés avec les taux de drop. */
  finishOdds: jsonb('finish_odds')
    .$type<FinishOdds>()
    .notNull()
    .default({ holo: 0.05, fullart: 0.01 }),
  /**
   * Cartes liées au compte (packs VIP, d'événement…). Règle JONUM, non négociable :
   * un pack payé en argent réel et aléatoire donne toujours des cartes liées.
   */
  bindsCards: boolean('binds_cards').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
});

/** Événements (spec §18). Pour l'instant : le nom affiché sur les Éditions Arène. */
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  /** Nom générique, sans marque de tournoi (ex. « Worlds 2026 »). */
  name: text('name').notNull(),
  startsAt: timestamptz('starts_at').notNull(),
  endsAt: timestamptz('ends_at').notNull(),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
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

/* ---------- Joueurs (spec §7, §7.1) ---------- */

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    username: text('username').notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    /** player | admin */
    role: text('role').notNull().default('player'),
    /** Pays déclaré à l'inscription (spec §17.9). */
    countryCode: char('country_code', { length: 2 }).notNull(),
    /** Case « 15 ans ou plus » cochée à l'inscription. */
    ageConfirmedAt: timestamptz('age_confirmed_at').notNull(),
    /** Vérification d'email prévue, pas encore active (`null` = non vérifié). */
    emailVerifiedAt: timestamptz('email_verified_at'),
    packsAvailable: smallint('packs_available').notNull().default(10),
    packsUpdatedAt: timestamptz('packs_updated_at').notNull().defaultNow(),
    pityCounter: smallint('pity_counter').notNull().default(0),
    /** Monnaie gagnée en jouant. */
    shards: integer('shards').notNull().default(0),
    /** Monnaie payante : prévue dès le départ, aucun paiement actif. */
    coins: integer('coins').notNull().default(0),
    /** Option « Animations réduites » du profil (en plus de prefers-reduced-motion). */
    reducedMotion: boolean('reduced_motion').notNull().default(false),
    /** Premier Hall of Fame vu : le saut de son animation est bloqué 1,5 s la première fois. */
    firstHofSeenAt: timestamptz('first_hof_seen_at'),
    createdAt: timestamptz('created_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('users_username_lower_idx').on(sql`lower(${t.username})`),
    uniqueIndex('users_email_lower_idx').on(sql`lower(${t.email})`),
    check('users_role_check', sql`${t.role} in ('player', 'admin')`),
    check('users_currencies_check', sql`${t.shards} >= 0 and ${t.coins} >= 0`),
  ],
);

/** Sessions : seul le hash SHA-256 du jeton est stocké, le jeton vit dans un cookie httpOnly. */
export const sessions = pgTable(
  'sessions',
  {
    tokenHash: text('token_hash').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamptz('created_at').notNull().defaultNow(),
    expiresAt: timestamptz('expires_at').notNull(),
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
);

export const userCards = pgTable(
  'user_cards',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    cardId: integer('card_id')
      .notNull()
      .references(() => cards.id),
    /** normal | holo | fullart | arena (apparence seulement). */
    finish: text('finish').notNull().default('normal'),
    /** true = liée au compte : ni vendable, ni échangeable, ni recyclable (règle JONUM, spec §17.4). */
    isBound: boolean('is_bound').notNull().default(false),
    /** Événement d'une Édition Arène (obligatoire pour arena, vide sinon). */
    eventId: integer('event_id').references(() => events.id),
    quantity: integer('quantity').notNull().default(1),
    isFavorite: boolean('is_favorite').notNull().default(false),
    /** Date d'obtention du premier exemplaire (« Tirée le … », date de l'Édition Arène). */
    firstObtainedAt: timestamptz('first_obtained_at').notNull().defaultNow(),
  },
  (t) => [
    // Les doublons se comptent par carte, finition, liaison et événement.
    uniqueIndex('user_cards_copy_unique').on(
      t.userId,
      t.cardId,
      t.finish,
      t.isBound,
      sql`coalesce(${t.eventId}, 0)`,
    ),
    check('user_cards_quantity_check', sql`${t.quantity} > 0`),
    check('user_cards_finish_check', sql`${t.finish} in ('normal', 'holo', 'fullart', 'arena')`),
    // Une Édition Arène est toujours liée au compte et rattachée à son événement.
    check(
      'user_cards_arena_check',
      sql`${t.finish} <> 'arena' or (${t.isBound} and ${t.eventId} is not null)`,
    ),
    index('user_cards_user_idx').on(t.userId, t.firstObtainedAt.desc()),
  ],
);

/** Journal de chaque tirage, pour l'idempotence et les litiges (spec §5.4, §8.3). */
export const packOpenings = pgTable(
  'pack_openings',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    packTypeId: integer('pack_type_id')
      .notNull()
      .references(() => packTypes.id),
    idempotencyKey: uuid('idempotency_key').notNull(),
    /** [{cardId, gameId, rarity, finish, isNew}], dans l'ordre de révélation (la plus rare en dernier). */
    cards: jsonb('cards').notNull(),
    /**
     * Cartes déjà révélées au joueur (règle anti-fuite) : l'API ne renvoie la rareté et la
     * finition d'une carte qu'à sa révélation, dans l'ordre.
     */
    revealedCount: smallint('revealed_count').notNull().default(0),
    openedAt: timestamptz('opened_at').notNull().defaultNow(),
  },
  (t) => [unique('pack_openings_idempotency_unique').on(t.userId, t.idempotencyKey)],
);

/** Tout mouvement de monnaie est tracé (spec §7.1). */
export const currencyLedger = pgTable(
  'currency_ledger',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** shards | coins */
    currency: text('currency').notNull(),
    delta: integer('delta').notNull(),
    /** recycle | pack_purchase | reward… */
    reason: text('reason').notNull(),
    refId: bigint('ref_id', { mode: 'number' }),
    createdAt: timestamptz('created_at').notNull().defaultNow(),
  },
  (t) => [
    check('currency_ledger_currency_check', sql`${t.currency} in ('shards', 'coins')`),
    index('currency_ledger_user_idx').on(t.userId, t.createdAt),
  ],
);

/**
 * Événements de drop annoncés à la communauté (« pseudo a tiré Jeu »).
 * Écrits dans la transaction d'ouverture ; le temps réel (SSE ou WebSocket) viendra plus tard.
 */
export const dropEvents = pgTable(
  'drop_events',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    /** card_drop_hof */
    kind: text('kind').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    cardId: integer('card_id')
      .notNull()
      .references(() => cards.id),
    createdAt: timestamptz('created_at').notNull().defaultNow(),
  },
  (t) => [
    check('drop_events_kind_check', sql`${t.kind} in ('card_drop_hof')`),
    index('drop_events_kind_created_idx').on(t.kind, t.createdAt),
  ],
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
