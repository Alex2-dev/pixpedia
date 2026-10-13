CREATE TABLE "drop_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"user_id" integer NOT NULL,
	"card_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "drop_events_kind_check" CHECK ("drop_events"."kind" in ('card_drop_hof'))
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reduced_motion" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "first_hof_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "drop_events" ADD CONSTRAINT "drop_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drop_events" ADD CONSTRAINT "drop_events_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "drop_events_kind_created_idx" ON "drop_events" USING btree ("kind","created_at");