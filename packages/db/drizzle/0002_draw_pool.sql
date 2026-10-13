CREATE TABLE "draw_pool" (
	"pack_type_id" integer NOT NULL,
	"rarity" text NOT NULL,
	"idx" integer NOT NULL,
	"card_id" integer NOT NULL,
	CONSTRAINT "draw_pool_pack_type_id_rarity_idx_pk" PRIMARY KEY("pack_type_id","rarity","idx")
);
--> statement-breakpoint
CREATE TABLE "draw_pool_counts" (
	"pack_type_id" integer NOT NULL,
	"rarity" text NOT NULL,
	"n" integer NOT NULL,
	CONSTRAINT "draw_pool_counts_pack_type_id_rarity_pk" PRIMARY KEY("pack_type_id","rarity")
);
--> statement-breakpoint
CREATE TABLE "pack_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"filter" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"cost" integer DEFAULT 0 NOT NULL,
	"odds" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "pack_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "draw_pool" ADD CONSTRAINT "draw_pool_pack_type_id_pack_types_id_fk" FOREIGN KEY ("pack_type_id") REFERENCES "public"."pack_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draw_pool" ADD CONSTRAINT "draw_pool_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draw_pool_counts" ADD CONSTRAINT "draw_pool_counts_pack_type_id_pack_types_id_fk" FOREIGN KEY ("pack_type_id") REFERENCES "public"."pack_types"("id") ON DELETE no action ON UPDATE no action;