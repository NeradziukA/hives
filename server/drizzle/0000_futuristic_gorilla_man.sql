CREATE TABLE "combat_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attacker_id" text,
	"defender_id" text,
	"hit_chance" integer,
	"damage" integer,
	"infection_roll" boolean,
	"outcome" text NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"hex_id" text,
	"occurred_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hex_ownership" (
	"hex_id" text PRIMARY KEY NOT NULL,
	"faction" text,
	"captured_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hex_visited" (
	"player_id" text,
	"hex_id" text NOT NULL,
	"first_visit" timestamp with time zone DEFAULT now(),
	"last_visit" timestamp with time zone DEFAULT now(),
	CONSTRAINT "hex_visited_player_id_hex_id_pk" PRIMARY KEY("player_id","hex_id")
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" text,
	"item_type" text NOT NULL,
	"item_data" jsonb,
	"is_equipped" boolean DEFAULT false,
	"obtained_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "player_tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"hex_id" text,
	"recorded_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" text PRIMARY KEY NOT NULL,
	"unit_type" text DEFAULT 'HUMAN_A' NOT NULL,
	"faction" text DEFAULT 'humans' NOT NULL,
	"role" text,
	"strength" integer DEFAULT 10,
	"defense" integer DEFAULT 10,
	"agility" integer DEFAULT 10,
	"speed" integer DEFAULT 10,
	"intelligence" integer DEFAULT 10,
	"hp" integer DEFAULT 100,
	"max_hp" integer DEFAULT 100,
	"leadership" integer DEFAULT 0,
	"vision" integer DEFAULT 10,
	"vaccine_level" integer DEFAULT 0,
	"bag_size" integer DEFAULT 5,
	"heavy_weapon" integer DEFAULT 0,
	"two_handed" integer DEFAULT 0,
	"camouflage" integer DEFAULT 0,
	"regeneration" integer DEFAULT 0,
	"stench" integer DEFAULT 0,
	"mutation" integer DEFAULT 0,
	"is_alive" boolean DEFAULT true,
	"respawn_at" timestamp with time zone,
	"infected_at" timestamp with time zone,
	"last_lat" double precision,
	"last_lng" double precision,
	"last_seen" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "static_objects" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"name" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"reveal_radius" integer NOT NULL,
	"faction" text,
	"captured_by" text,
	"captured_at" timestamp with time zone,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "zombie_patrols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"zombie_id" text,
	"waypoints" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "combat_events" ADD CONSTRAINT "combat_events_attacker_id_players_id_fk" FOREIGN KEY ("attacker_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combat_events" ADD CONSTRAINT "combat_events_defender_id_players_id_fk" FOREIGN KEY ("defender_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hex_visited" ADD CONSTRAINT "hex_visited_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_tracks" ADD CONSTRAINT "player_tracks_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "static_objects" ADD CONSTRAINT "static_objects_captured_by_players_id_fk" FOREIGN KEY ("captured_by") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zombie_patrols" ADD CONSTRAINT "zombie_patrols_zombie_id_players_id_fk" FOREIGN KEY ("zombie_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;