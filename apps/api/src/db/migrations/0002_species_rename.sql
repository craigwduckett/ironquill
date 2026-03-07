-- Rename srd_races → srd_species, add display_term enum column,
-- and rename the FK column on characters from race_id → species_id.
-- 2014 rows keep displayTerm='Race'; 2024 rows will use 'Species'.

-- Step 1: New enum for the display term
CREATE TYPE "public"."srd_species_display_term" AS ENUM('Race', 'Species');--> statement-breakpoint

-- Step 2: Rename the table
ALTER TABLE "srd_races" RENAME TO "srd_species";--> statement-breakpoint

-- Step 3: Add the display_term column (defaults to 'Race' for existing 2014 rows)
ALTER TABLE "srd_species" ADD COLUMN "display_term" "srd_species_display_term" DEFAULT 'Race' NOT NULL;--> statement-breakpoint

-- Step 4: Drop the old FK on characters referencing race_id → srd_races
ALTER TABLE "characters" DROP CONSTRAINT "characters_race_id_srd_races_id_fk";--> statement-breakpoint

-- Step 5: Rename the FK column on characters
ALTER TABLE "characters" RENAME COLUMN "race_id" TO "species_id";--> statement-breakpoint

-- Step 6: Re-add the FK pointing to the renamed table
ALTER TABLE "characters" ADD CONSTRAINT "characters_species_id_srd_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."srd_species"("id") ON DELETE no action ON UPDATE no action;
