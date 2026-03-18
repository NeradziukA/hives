CREATE TABLE "npc_patrols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"npc_id" text,
	"speed" double precision DEFAULT 1.4 NOT NULL,
	"waypoints" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "npc_patrols" ADD CONSTRAINT "npc_patrols_npc_id_players_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;