CREATE TYPE "public"."managed_by" AS ENUM('self', 'dm');--> statement-breakpoint
CREATE TYPE "public"."item_category" AS ENUM('weapon', 'armor', 'adventuring_gear', 'tool', 'magic_item');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "character_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"item_id" uuid,
	"custom_item_name" varchar(200),
	"quantity" integer DEFAULT 1 NOT NULL,
	"equipped" boolean DEFAULT false NOT NULL,
	"notes" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "character_spells" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"spell_id" uuid NOT NULL,
	"prepared" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"managed_by" "managed_by" DEFAULT 'self' NOT NULL,
	"preset_source_id" uuid,
	"name" varchar(100) NOT NULL,
	"race_id" uuid,
	"class_id" uuid,
	"background_id" uuid,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"alignment" varchar(30),
	"ability_scores" jsonb NOT NULL,
	"hp_current" integer DEFAULT 0 NOT NULL,
	"hp_max" integer DEFAULT 0 NOT NULL,
	"hp_temp" integer DEFAULT 0 NOT NULL,
	"ac" integer DEFAULT 10 NOT NULL,
	"speed" integer DEFAULT 30 NOT NULL,
	"proficiency_bonus" integer DEFAULT 2 NOT NULL,
	"skill_proficiencies" text[] DEFAULT '{}' NOT NULL,
	"personality" jsonb,
	"appearance" jsonb,
	"portrait_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "srd_backgrounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"skill_proficiencies" text[] DEFAULT '{}' NOT NULL,
	"tool_proficiencies" text[] DEFAULT '{}' NOT NULL,
	"languages_count" integer DEFAULT 0 NOT NULL,
	"equipment" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"feature_name" varchar(100) NOT NULL,
	"feature_description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "srd_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"hit_die" varchar(5) NOT NULL,
	"primary_abilities" text[] DEFAULT '{}' NOT NULL,
	"saving_throws" text[] DEFAULT '{}' NOT NULL,
	"armor_proficiencies" text[] DEFAULT '{}' NOT NULL,
	"weapon_proficiencies" text[] DEFAULT '{}' NOT NULL,
	"skill_choices" jsonb,
	"features_by_level" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"spellcasting_info" jsonb,
	"starting_equipment" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "srd_conditions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"mechanical_effects" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "srd_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"category" "item_category" NOT NULL,
	"cost" jsonb,
	"weight" real,
	"properties" jsonb,
	"description" text NOT NULL,
	"rarity" varchar(50),
	"requires_attunement" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "srd_monsters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"size" varchar(20) NOT NULL,
	"type" varchar(50) NOT NULL,
	"alignment" varchar(100) NOT NULL,
	"ac" integer NOT NULL,
	"ac_type" varchar(100),
	"hp" integer NOT NULL,
	"hp_formula" varchar(50) NOT NULL,
	"speed" jsonb NOT NULL,
	"ability_scores" jsonb NOT NULL,
	"saving_throws" jsonb,
	"skills" jsonb,
	"damage_resistances" text[],
	"damage_immunities" text[],
	"condition_immunities" text[],
	"senses" text NOT NULL,
	"languages" text NOT NULL,
	"cr" real NOT NULL,
	"xp" integer NOT NULL,
	"actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"legendary_actions" jsonb,
	"special_abilities" jsonb
);
--> statement-breakpoint
CREATE TABLE "srd_races" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"traits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ability_bonuses" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"languages" text[] DEFAULT '{}' NOT NULL,
	"speed" integer DEFAULT 30 NOT NULL,
	"size" varchar(20) DEFAULT 'Medium' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "srd_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar(100) NOT NULL,
	"topic" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"keywords" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "srd_spells" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"level" integer NOT NULL,
	"school" varchar(50) NOT NULL,
	"casting_time" varchar(100) NOT NULL,
	"range" varchar(100) NOT NULL,
	"components" jsonb NOT NULL,
	"duration" varchar(100) NOT NULL,
	"concentration" boolean DEFAULT false NOT NULL,
	"ritual" boolean DEFAULT false NOT NULL,
	"description" text NOT NULL,
	"higher_levels" text,
	"classes" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "character_inventory" ADD CONSTRAINT "character_inventory_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_spells" ADD CONSTRAINT "character_spells_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_race_id_srd_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."srd_races"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_class_id_srd_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."srd_classes"("id") ON DELETE no action ON UPDATE no action;