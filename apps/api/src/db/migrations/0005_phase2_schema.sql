-- Phase 2 schema: adventures, character_presets, adventure_players,
-- scenes, scene_npcs, sessions, session_combat, session_npc_hp,
-- session_conditions, roll_log.
-- Also adds FK from characters.preset_source_id → character_presets.id.

-- ── Enums ──────────────────────────────────────────────────────────────────────

CREATE TYPE "public"."adventure_type" AS ENUM('campaign', 'one_shot');--> statement-breakpoint
CREATE TYPE "public"."ruleset" AS ENUM('standard', 'kids', 'custom');--> statement-breakpoint
CREATE TYPE "public"."adventure_status" AS ENUM('draft', 'active', 'completed');--> statement-breakpoint
CREATE TYPE "public"."adventure_player_role" AS ENUM('player', 'co_dm');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('lobby', 'active', 'paused', 'ended');--> statement-breakpoint

-- ── Adventures ─────────────────────────────────────────────────────────────────

CREATE TABLE "adventures" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" uuid NOT NULL,
  "title" varchar(200) NOT NULL,
  "description" text,
  "setting" text,
  "cover_image_id" text,
  "adventure_type" "adventure_type" DEFAULT 'campaign' NOT NULL,
  "ruleset" "ruleset" DEFAULT 'standard' NOT NULL,
  "ruleset_overrides" jsonb,
  "level_range_min" integer DEFAULT 1 NOT NULL,
  "level_range_max" integer DEFAULT 5 NOT NULL,
  "player_capacity_min" integer DEFAULT 1 NOT NULL,
  "player_capacity_max" integer DEFAULT 6 NOT NULL,
  "invite_code" varchar(16),
  "status" "adventure_status" DEFAULT 'draft' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

-- ── Character Presets (Kids Mode) ──────────────────────────────────────────────

CREATE TABLE "character_presets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" uuid NOT NULL,
  "adventure_id" uuid,
  "name" varchar(100) NOT NULL,
  "level_override" integer,
  "base_character_data" jsonb DEFAULT '{}' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

-- ── Adventure Players ───────────────────────────────────────────────────────────

CREATE TABLE "adventure_players" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "adventure_id" uuid NOT NULL,
  "user_id" uuid,
  "character_id" uuid,
  "preset_id" uuid,
  "role" "adventure_player_role" DEFAULT 'player' NOT NULL,
  "joined_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "adventure_players_adventure_user_unique" UNIQUE("adventure_id", "user_id")
);--> statement-breakpoint

-- ── Scenes ─────────────────────────────────────────────────────────────────────

CREATE TABLE "scenes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "adventure_id" uuid NOT NULL,
  "title" varchar(200) NOT NULL,
  "narrative_read_aloud" text,
  "dm_notes" text,
  "order_index" integer DEFAULT 0 NOT NULL,
  "background_image_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

-- ── Scene NPCs ──────────────────────────────────────────────────────────────────

CREATE TABLE "scene_npcs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "scene_id" uuid NOT NULL,
  "monster_id" uuid,
  "custom_name" varchar(200),
  "custom_hp_max" integer,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

-- ── Sessions ───────────────────────────────────────────────────────────────────

CREATE TABLE "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "adventure_id" uuid NOT NULL,
  "current_scene_id" uuid,
  "status" "session_status" DEFAULT 'lobby' NOT NULL,
  "started_at" timestamp with time zone,
  "ended_at" timestamp with time zone,
  "summary" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

-- ── Session Combat ─────────────────────────────────────────────────────────────

CREATE TABLE "session_combat" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "round" integer DEFAULT 1 NOT NULL,
  "is_active" integer DEFAULT 1 NOT NULL,
  "initiative_order" jsonb DEFAULT '[]' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "session_combat_session_id_unique" UNIQUE("session_id")
);--> statement-breakpoint

-- ── Session NPC HP ─────────────────────────────────────────────────────────────

CREATE TABLE "session_npc_hp" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "npc_id" uuid NOT NULL,
  "hp_current" integer NOT NULL,
  "hp_max" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

-- ── Session Conditions ──────────────────────────────────────────────────────────

CREATE TABLE "session_conditions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "character_id" uuid,
  "npc_id" uuid,
  "condition_id" uuid NOT NULL,
  "applied_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

-- ── Roll Log ───────────────────────────────────────────────────────────────────

CREATE TABLE "roll_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "character_id" uuid,
  "roll_type" varchar(100) NOT NULL,
  "result" integer NOT NULL,
  "rolled_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

-- ── Foreign Keys ───────────────────────────────────────────────────────────────

ALTER TABLE "adventures" ADD CONSTRAINT "adventures_owner_id_users_id_fk"
  FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade;--> statement-breakpoint

ALTER TABLE "character_presets" ADD CONSTRAINT "character_presets_owner_id_users_id_fk"
  FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "character_presets" ADD CONSTRAINT "character_presets_adventure_id_adventures_id_fk"
  FOREIGN KEY ("adventure_id") REFERENCES "public"."adventures"("id") ON DELETE cascade;--> statement-breakpoint

ALTER TABLE "adventure_players" ADD CONSTRAINT "adventure_players_adventure_id_adventures_id_fk"
  FOREIGN KEY ("adventure_id") REFERENCES "public"."adventures"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "adventure_players" ADD CONSTRAINT "adventure_players_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "adventure_players" ADD CONSTRAINT "adventure_players_character_id_characters_id_fk"
  FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE set null;--> statement-breakpoint
ALTER TABLE "adventure_players" ADD CONSTRAINT "adventure_players_preset_id_character_presets_id_fk"
  FOREIGN KEY ("preset_id") REFERENCES "public"."character_presets"("id") ON DELETE set null;--> statement-breakpoint

ALTER TABLE "scenes" ADD CONSTRAINT "scenes_adventure_id_adventures_id_fk"
  FOREIGN KEY ("adventure_id") REFERENCES "public"."adventures"("id") ON DELETE cascade;--> statement-breakpoint

ALTER TABLE "scene_npcs" ADD CONSTRAINT "scene_npcs_scene_id_scenes_id_fk"
  FOREIGN KEY ("scene_id") REFERENCES "public"."scenes"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "scene_npcs" ADD CONSTRAINT "scene_npcs_monster_id_srd_monsters_id_fk"
  FOREIGN KEY ("monster_id") REFERENCES "public"."srd_monsters"("id") ON DELETE set null;--> statement-breakpoint

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_adventure_id_adventures_id_fk"
  FOREIGN KEY ("adventure_id") REFERENCES "public"."adventures"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_current_scene_id_scenes_id_fk"
  FOREIGN KEY ("current_scene_id") REFERENCES "public"."scenes"("id") ON DELETE set null;--> statement-breakpoint

ALTER TABLE "session_combat" ADD CONSTRAINT "session_combat_session_id_sessions_id_fk"
  FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade;--> statement-breakpoint

ALTER TABLE "session_npc_hp" ADD CONSTRAINT "session_npc_hp_session_id_sessions_id_fk"
  FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "session_npc_hp" ADD CONSTRAINT "session_npc_hp_npc_id_scene_npcs_id_fk"
  FOREIGN KEY ("npc_id") REFERENCES "public"."scene_npcs"("id") ON DELETE cascade;--> statement-breakpoint

ALTER TABLE "session_conditions" ADD CONSTRAINT "session_conditions_session_id_sessions_id_fk"
  FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "session_conditions" ADD CONSTRAINT "session_conditions_character_id_characters_id_fk"
  FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "session_conditions" ADD CONSTRAINT "session_conditions_npc_id_scene_npcs_id_fk"
  FOREIGN KEY ("npc_id") REFERENCES "public"."scene_npcs"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "session_conditions" ADD CONSTRAINT "session_conditions_condition_id_srd_conditions_id_fk"
  FOREIGN KEY ("condition_id") REFERENCES "public"."srd_conditions"("id");--> statement-breakpoint

ALTER TABLE "roll_log" ADD CONSTRAINT "roll_log_session_id_sessions_id_fk"
  FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "roll_log" ADD CONSTRAINT "roll_log_character_id_characters_id_fk"
  FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE set null;--> statement-breakpoint

-- FK from characters.preset_source_id → character_presets.id
ALTER TABLE "characters" ADD CONSTRAINT "characters_preset_source_id_character_presets_id_fk"
  FOREIGN KEY ("preset_source_id") REFERENCES "public"."character_presets"("id") ON DELETE set null;
