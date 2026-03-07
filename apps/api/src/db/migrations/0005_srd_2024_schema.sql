-- Migration: SRD 2024 schema additions
-- Adds new columns to existing SRD tables to support 2024 rule changes,
-- adds the srd_feats table, and adds preferred_edition to adventures.

-- ── srd_species: 2024 additions ───────────────────────────────────────────────
-- Some 2024 species choose their size (e.g. Human can be Small or Medium).
ALTER TABLE "srd_species" ADD COLUMN "size_options" text[] NOT NULL DEFAULT '{}';--> statement-breakpoint
-- 2024 explicitly declares creature type (almost always 'Humanoid').
ALTER TABLE "srd_species" ADD COLUMN "creature_type" varchar(50) NOT NULL DEFAULT 'Humanoid';--> statement-breakpoint

-- ── srd_classes: 2024 additions ───────────────────────────────────────────────
-- 2024 classes list their subclasses with the level at which they are gained.
ALTER TABLE "srd_classes" ADD COLUMN "subclasses" jsonb NOT NULL DEFAULT '[]';--> statement-breakpoint
-- 2024 classes list which Weapon Mastery properties they can use.
ALTER TABLE "srd_classes" ADD COLUMN "weapon_masteries" text[] NOT NULL DEFAULT '{}';--> statement-breakpoint

-- ── srd_backgrounds: 2024 additions ──────────────────────────────────────────
-- 2024: player picks 2 of 3 ability scores for +2/+1 or +1/+1/+1.
ALTER TABLE "srd_backgrounds" ADD COLUMN "ability_score_options" text[] NOT NULL DEFAULT '{}';--> statement-breakpoint
-- 2024: the Origin Feat granted by this Background (null for 2014 rows).
ALTER TABLE "srd_backgrounds" ADD COLUMN "origin_feat" jsonb DEFAULT NULL;--> statement-breakpoint

-- ── srd_items: 2024 additions ─────────────────────────────────────────────────
-- 2024: every weapon has exactly one Weapon Mastery property. Null for 2014 rows.
ALTER TABLE "srd_items" ADD COLUMN "weapon_mastery" varchar(50);--> statement-breakpoint

-- ── srd_feats: new table (2024 only) ──────────────────────────────────────────
CREATE TYPE "public"."srd_feat_type" AS ENUM('origin', 'general', 'fighting-style', 'epic-boon');--> statement-breakpoint

CREATE TABLE "srd_feats" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "source_edition" "srd_edition" NOT NULL DEFAULT '2024',
  "name" varchar(100) NOT NULL,
  "description" text NOT NULL,
  "type" "srd_feat_type" NOT NULL,
  "prerequisites" jsonb DEFAULT NULL,
  "repeatable" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "srd_feats_name_edition_uq" UNIQUE("name", "source_edition")
);--> statement-breakpoint

-- ── adventures: preferred_edition ────────────────────────────────────────────
-- Determines which SRD edition data is shown during character creation.
ALTER TABLE "adventures" ADD COLUMN "preferred_edition" "srd_edition" NOT NULL DEFAULT '2024';--> statement-breakpoint
