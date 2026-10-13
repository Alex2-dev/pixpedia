CREATE TABLE "currency_ledger" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"currency" text NOT NULL,
	"delta" integer NOT NULL,
	"reason" text NOT NULL,
	"ref_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "currency_ledger_currency_check" CHECK ("currency_ledger"."currency" in ('shards', 'coins'))
);
--> statement-breakpoint
CREATE TABLE "pack_openings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"pack_type_id" integer NOT NULL,
	"idempotency_key" uuid NOT NULL,
	"cards" jsonb NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pack_openings_idempotency_unique" UNIQUE("user_id","idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_cards" (
	"user_id" integer NOT NULL,
	"card_id" integer NOT NULL,
	"finish" text DEFAULT 'normal' NOT NULL,
	"is_bound" boolean DEFAULT false NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"first_obtained_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_cards_user_id_card_id_finish_is_bound_pk" PRIMARY KEY("user_id","card_id","finish","is_bound"),
	CONSTRAINT "user_cards_quantity_check" CHECK ("user_cards"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'player' NOT NULL,
	"country_code" char(2) NOT NULL,
	"age_confirmed_at" timestamp with time zone NOT NULL,
	"email_verified_at" timestamp with time zone,
	"packs_available" smallint DEFAULT 10 NOT NULL,
	"packs_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"pity_counter" smallint DEFAULT 0 NOT NULL,
	"shards" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_role_check" CHECK ("users"."role" in ('player', 'admin')),
	CONSTRAINT "users_currencies_check" CHECK ("users"."shards" >= 0 and "users"."coins" >= 0)
);
--> statement-breakpoint
ALTER TABLE "currency_ledger" ADD CONSTRAINT "currency_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_openings" ADD CONSTRAINT "pack_openings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_openings" ADD CONSTRAINT "pack_openings_pack_type_id_pack_types_id_fk" FOREIGN KEY ("pack_type_id") REFERENCES "public"."pack_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_cards" ADD CONSTRAINT "user_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_cards" ADD CONSTRAINT "user_cards_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "currency_ledger_user_idx" ON "currency_ledger" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_cards_user_idx" ON "user_cards" USING btree ("user_id","first_obtained_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_lower_idx" ON "users" USING btree (lower("username"));--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_idx" ON "users" USING btree (lower("email"));