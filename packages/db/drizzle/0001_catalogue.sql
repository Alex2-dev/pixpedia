CREATE TABLE "blocked_games" (
	"game_id" integer PRIMARY KEY NOT NULL,
	"reason" text NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"game_id" integer NOT NULL,
	"rarity" text NOT NULL,
	"score_at_print" real NOT NULL,
	"atk" smallint NOT NULL,
	"def" smallint NOT NULL,
	"hp" smallint NOT NULL,
	"spd" smallint NOT NULL,
	"family" text NOT NULL,
	"combat" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cards_series_game_unique" UNIQUE("series_id","game_id"),
	CONSTRAINT "cards_rarity_check" CHECK ("cards"."rarity" in ('starter', 'bonus', 'combo', 'boss', 'final', 'hof')),
	CONSTRAINT "cards_family_check" CHECK ("cards"."family" in ('action', 'strategie', 'vitesse', 'aventure', 'rpg')),
	CONSTRAINT "cards_stats_check" CHECK ("cards"."atk" between 10 and 99 and "cards"."def" between 10 and 99 and "cards"."hp" between 10 and 99 and "cards"."spd" between 10 and 99)
);
--> statement-breakpoint
CREATE TABLE "country_features" (
	"country_code" char(2) PRIMARY KEY NOT NULL,
	"can_subscribe" boolean DEFAULT false NOT NULL,
	"can_buy_coins" boolean DEFAULT false NOT NULL,
	"can_use_market" boolean DEFAULT true NOT NULL,
	"can_earn_coins" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_genres" (
	"game_id" integer NOT NULL,
	"genre_id" integer NOT NULL,
	CONSTRAINT "game_genres_game_id_genre_id_pk" PRIMARY KEY("game_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "game_platforms" (
	"game_id" integer NOT NULL,
	"platform_id" integer NOT NULL,
	CONSTRAINT "game_platforms_game_id_platform_id_pk" PRIMARY KEY("game_id","platform_id")
);
--> statement-breakpoint
CREATE TABLE "game_themes" (
	"game_id" integer NOT NULL,
	"theme_id" integer NOT NULL,
	CONSTRAINT "game_themes_game_id_theme_id_pk" PRIMARY KEY("game_id","theme_id")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text,
	"first_release_date" date,
	"release_decade" smallint,
	"cover_image_id" text,
	"game_type" smallint,
	"total_rating" real,
	"total_rating_count" integer DEFAULT 0 NOT NULL,
	"time_to_beat_sec" integer,
	"developer_name" text,
	"keywords" text[] DEFAULT '{}'::text[] NOT NULL,
	"content_descriptors" text[] DEFAULT '{}'::text[] NOT NULL,
	"esrb_adults_only" boolean DEFAULT false NOT NULL,
	"prestige_score" real,
	"status" text DEFAULT 'eligible' NOT NULL,
	"status_reason" text,
	"is_drawable" boolean DEFAULT true NOT NULL,
	"igdb_updated_at" timestamp with time zone,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "games_status_check" CHECK ("games"."status" in ('eligible', 'quarantine', 'excluded'))
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"abbreviation" text,
	"family" text,
	"is_official" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rarity_overrides" (
	"game_id" integer PRIMARY KEY NOT NULL,
	"min_rarity" text NOT NULL,
	"reason" text NOT NULL,
	CONSTRAINT "rarity_overrides_rarity_check" CHECK ("rarity_overrides"."min_rarity" in ('starter', 'bonus', 'combo', 'boss', 'final', 'hof'))
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"rarity_params" jsonb NOT NULL,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "series_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sync_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"added" integer DEFAULT 0 NOT NULL,
	"updated" integer DEFAULT 0 NOT NULL,
	"excluded" integer DEFAULT 0 NOT NULL,
	"quarantined" integer DEFAULT 0 NOT NULL,
	"error" text,
	"report" jsonb
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_genres" ADD CONSTRAINT "game_genres_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_genres" ADD CONSTRAINT "game_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_platforms" ADD CONSTRAINT "game_platforms_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_platforms" ADD CONSTRAINT "game_platforms_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_themes" ADD CONSTRAINT "game_themes_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_themes" ADD CONSTRAINT "game_themes_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rarity_overrides" ADD CONSTRAINT "rarity_overrides_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cards_game_idx" ON "cards" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "games_status_idx" ON "games" USING btree ("status");--> statement-breakpoint
CREATE INDEX "games_igdb_updated_at_idx" ON "games" USING btree ("igdb_updated_at");--> statement-breakpoint
CREATE INDEX "games_name_trgm_idx" ON "games" USING gin ("name" gin_trgm_ops);