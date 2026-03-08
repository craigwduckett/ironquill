-- Phase 2 complete: scene enhancements (scene_type, dm_tips, loot, position),
-- scene_connections, encounters, encounter_monsters.

-- ── New enums ─────────────────────────────────────────────────────────────────

CREATE TYPE "public"."scene_type" AS ENUM(
  'exploration',
  'social',
  'combat',
  'puzzle',
  'rest',
  'transition'
);--> statement-breakpoint

CREATE TYPE "public"."encounter_difficulty" AS ENUM(
  'easy',
  'medium',
  'hard',
  'deadly'
);--> statement-breakpoint

-- ── Add columns to scenes ─────────────────────────────────────────────────────

ALTER TABLE "scenes"
  ADD COLUMN "scene_type" "scene_type" NOT NULL DEFAULT 'exploration',
  ADD COLUMN "dm_tips" text,
  ADD COLUMN "loot" jsonb,
  ADD COLUMN "position_x" double precision,
  ADD COLUMN "position_y" double precision;--> statement-breakpoint

-- ── Scene connections ─────────────────────────────────────────────────────────

CREATE TABLE "scene_connections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "from_scene_id" uuid NOT NULL,
  "to_scene_id" uuid NOT NULL,
  "label" varchar(200),
  "condition_notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

ALTER TABLE "scene_connections"
  ADD CONSTRAINT "scene_connections_from_scene_id_scenes_id_fk"
  FOREIGN KEY ("from_scene_id") REFERENCES "public"."scenes"("id") ON DELETE cascade;--> statement-breakpoint

ALTER TABLE "scene_connections"
  ADD CONSTRAINT "scene_connections_to_scene_id_scenes_id_fk"
  FOREIGN KEY ("to_scene_id") REFERENCES "public"."scenes"("id") ON DELETE cascade;--> statement-breakpoint

ALTER TABLE "scene_connections"
  ADD CONSTRAINT "scene_connections_from_to_unique" UNIQUE ("from_scene_id", "to_scene_id");--> statement-breakpoint

-- ── Encounters ────────────────────────────────────────────────────────────────

CREATE TABLE "encounters" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "scene_id" uuid NOT NULL,
  "difficulty_rating" "encounter_difficulty",
  "terrain_notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "encounters_scene_id_unique" UNIQUE("scene_id")
);--> statement-breakpoint

ALTER TABLE "encounters"
  ADD CONSTRAINT "encounters_scene_id_scenes_id_fk"
  FOREIGN KEY ("scene_id") REFERENCES "public"."scenes"("id") ON DELETE cascade;--> statement-breakpoint

-- ── Encounter monsters ────────────────────────────────────────────────────────

CREATE TABLE "encounter_monsters" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "encounter_id" uuid NOT NULL,
  "srd_monster_id" uuid,
  "custom_stat_block" jsonb,
  "quantity" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

ALTER TABLE "encounter_monsters"
  ADD CONSTRAINT "encounter_monsters_encounter_id_encounters_id_fk"
  FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade;--> statement-breakpoint

ALTER TABLE "encounter_monsters"
  ADD CONSTRAINT "encounter_monsters_srd_monster_id_srd_monsters_id_fk"
  FOREIGN KEY ("srd_monster_id") REFERENCES "public"."srd_monsters"("id") ON DELETE set null;
