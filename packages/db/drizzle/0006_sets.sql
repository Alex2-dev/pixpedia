CREATE TABLE "companies" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "franchises" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_companies" (
	"game_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "game_companies_game_id_company_id_role_pk" PRIMARY KEY("game_id","company_id","role"),
	CONSTRAINT "game_companies_role_check" CHECK ("game_companies"."role" in ('developer', 'publisher'))
);
--> statement-breakpoint
CREATE TABLE "game_franchises" (
	"game_id" integer NOT NULL,
	"franchise_id" integer NOT NULL,
	CONSTRAINT "game_franchises_game_id_franchise_id_pk" PRIMARY KEY("game_id","franchise_id")
);
--> statement-breakpoint
CREATE TABLE "set_cards" (
	"set_id" integer NOT NULL,
	"card_id" integer NOT NULL,
	CONSTRAINT "set_cards_set_id_card_id_pk" PRIMARY KEY("set_id","card_id")
);
--> statement-breakpoint
CREATE TABLE "sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"type" text NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"total" integer NOT NULL,
	CONSTRAINT "sets_series_type_key_unique" UNIQUE("series_id","type","key")
);
--> statement-breakpoint
ALTER TABLE "game_companies" ADD CONSTRAINT "game_companies_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_companies" ADD CONSTRAINT "game_companies_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_franchises" ADD CONSTRAINT "game_franchises_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_franchises" ADD CONSTRAINT "game_franchises_franchise_id_franchises_id_fk" FOREIGN KEY ("franchise_id") REFERENCES "public"."franchises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_cards" ADD CONSTRAINT "set_cards_set_id_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_cards" ADD CONSTRAINT "set_cards_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "game_companies_company_idx" ON "game_companies" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "game_franchises_franchise_idx" ON "game_franchises" USING btree ("franchise_id");--> statement-breakpoint
CREATE INDEX "set_cards_card_idx" ON "set_cards" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "sets_type_idx" ON "sets" USING btree ("series_id","type","total");