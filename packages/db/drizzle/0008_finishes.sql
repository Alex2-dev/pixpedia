CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "user_cards" DROP CONSTRAINT "user_cards_user_id_card_id_finish_is_bound_pk";--> statement-breakpoint
ALTER TABLE "pack_types" ADD COLUMN "finish_odds" jsonb DEFAULT '{"holo":0.05,"fullart":0.01}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "pack_types" ADD COLUMN "binds_cards" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_cards" ADD COLUMN "id" bigserial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "user_cards" ADD COLUMN "event_id" integer;--> statement-breakpoint
ALTER TABLE "user_cards" ADD CONSTRAINT "user_cards_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_cards_copy_unique" ON "user_cards" USING btree ("user_id","card_id","finish","is_bound",coalesce("event_id", 0));--> statement-breakpoint
-- Ancien nom de la finition full art (avant la contrainte ci-dessous).
UPDATE "user_cards" SET "finish" = 'fullart' WHERE "finish" = 'full_art';--> statement-breakpoint
ALTER TABLE "user_cards" ADD CONSTRAINT "user_cards_finish_check" CHECK ("user_cards"."finish" in ('normal', 'holo', 'fullart', 'arena'));--> statement-breakpoint
ALTER TABLE "user_cards" ADD CONSTRAINT "user_cards_arena_check" CHECK ("user_cards"."finish" <> 'arena' or ("user_cards"."is_bound" and "user_cards"."event_id" is not null));