CREATE TYPE "public"."srd_edition" AS ENUM('2014', '2024');--> statement-breakpoint
ALTER TABLE "srd_backgrounds" ADD COLUMN "source_edition" "srd_edition" DEFAULT '2014' NOT NULL;--> statement-breakpoint
ALTER TABLE "srd_classes" ADD COLUMN "source_edition" "srd_edition" DEFAULT '2014' NOT NULL;--> statement-breakpoint
ALTER TABLE "srd_conditions" ADD COLUMN "source_edition" "srd_edition" DEFAULT '2014' NOT NULL;--> statement-breakpoint
ALTER TABLE "srd_items" ADD COLUMN "source_edition" "srd_edition" DEFAULT '2014' NOT NULL;--> statement-breakpoint
ALTER TABLE "srd_monsters" ADD COLUMN "source_edition" "srd_edition" DEFAULT '2014' NOT NULL;--> statement-breakpoint
ALTER TABLE "srd_races" ADD COLUMN "source_edition" "srd_edition" DEFAULT '2014' NOT NULL;--> statement-breakpoint
ALTER TABLE "srd_rules" ADD COLUMN "source_edition" "srd_edition" DEFAULT '2014' NOT NULL;--> statement-breakpoint
ALTER TABLE "srd_spells" ADD COLUMN "source_edition" "srd_edition" DEFAULT '2014' NOT NULL;