import { z } from 'zod';

// ── Edition ───────────────────────────────────────────────────────────────────

export const SrdEditionSchema = z.enum(['2014', '2024']);
export type SrdEdition = z.infer<typeof SrdEditionSchema>;

// ── Feat ──────────────────────────────────────────────────────────────────────
// SRD 5.2 (2024) only. Every Background grants an Origin feat.

export const FeatTypeSchema = z.enum(['origin', 'general', 'fighting-style', 'epic-boon']);
export type FeatType = z.infer<typeof FeatTypeSchema>;

export const FeatPrerequisitesSchema = z
  .object({
    minimumLevel: z.number().int().min(1).optional(),
    featureNamed: z.string().optional(),
    abilityScore: z
      .object({
        name: z.string(),
        minimum: z.number().int(),
      })
      .optional(),
  })
  .nullable();
export type FeatPrerequisites = z.infer<typeof FeatPrerequisitesSchema>;

export const FeatSchema = z.object({
  id: z.string().uuid(),
  sourceEdition: SrdEditionSchema,
  name: z.string(),
  description: z.string(),
  type: FeatTypeSchema,
  prerequisites: FeatPrerequisitesSchema,
  repeatable: z.string().nullable(),
  createdAt: z.coerce.date(),
});
export type Feat = z.infer<typeof FeatSchema>;

export const FeatListResponseSchema = z.array(FeatSchema);

// ── Species ───────────────────────────────────────────────────────────────────

export const SpeciesTraitSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const SpeciesSchema = z.object({
  id: z.string().uuid(),
  sourceEdition: SrdEditionSchema,
  displayTerm: z.enum(['Race', 'Species']),
  name: z.string(),
  description: z.string().nullable(),
  traits: z.array(SpeciesTraitSchema),
  abilityBonuses: z.record(z.string(), z.number()),
  languages: z.array(z.string()),
  languageDesc: z.string().nullable(),
  speed: z.number().int(),
  size: z.string(),
  sizeOptions: z.array(z.string()),
  creatureType: z.string(),
});
export type Species = z.infer<typeof SpeciesSchema>;

// ── Background ────────────────────────────────────────────────────────────────

export const OriginFeatRefSchema = z
  .object({
    index: z.string(),
    name: z.string(),
    note: z.string().optional(),
  })
  .nullable();

export const BackgroundSchema = z.object({
  id: z.string().uuid(),
  sourceEdition: SrdEditionSchema,
  name: z.string(),
  description: z.string().nullable(),
  skillProficiencies: z.array(z.string()),
  toolProficiencies: z.array(z.string()),
  languagesCount: z.number().int(),
  equipment: z.array(z.record(z.string(), z.unknown())),
  featureName: z.string(),
  featureDescription: z.string(),
  // 2024: ability score options (e.g. ['INT', 'WIS', 'CHA'])
  abilityScoreOptions: z.array(z.string()),
  // 2024: origin feat granted by this background
  originFeat: OriginFeatRefSchema,
});
export type Background = z.infer<typeof BackgroundSchema>;

// ── Class ─────────────────────────────────────────────────────────────────────

export const SubclassRefSchema = z.object({
  name: z.string(),
  gainedAtLevel: z.number().int(),
});

export const ClassFeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const ClassFeatureLevelSchema = z.object({
  level: z.number().int(),
  features: z.array(ClassFeatureSchema),
});

export const SrdClassSchema = z.object({
  id: z.string().uuid(),
  sourceEdition: SrdEditionSchema,
  name: z.string(),
  description: z.string().nullable(),
  hitDie: z.string(),
  primaryAbilities: z.array(z.string()),
  savingThrows: z.array(z.string()),
  armorProficiencies: z.array(z.string()),
  weaponProficiencies: z.array(z.string()),
  skillChoices: z
    .object({
      choose: z.number().int(),
      from: z.array(z.string()),
    })
    .nullable(),
  featuresByLevel: z.array(ClassFeatureLevelSchema),
  spellcastingInfo: z.record(z.string(), z.unknown()).nullable(),
  startingEquipment: z.array(z.record(z.string(), z.unknown())),
  // 2024
  subclasses: z.array(SubclassRefSchema),
  weaponMasteries: z.array(z.string()),
});
export type SrdClass = z.infer<typeof SrdClassSchema>;

// ── Item ──────────────────────────────────────────────────────────────────────

export const SrdItemSchema = z.object({
  id: z.string().uuid(),
  sourceEdition: SrdEditionSchema,
  name: z.string(),
  category: z.enum(['weapon', 'armor', 'adventuring_gear', 'tool', 'magic_item']),
  cost: z.object({ amount: z.number(), unit: z.string() }).nullable(),
  weight: z.number().nullable(),
  properties: z.record(z.string(), z.unknown()).nullable(),
  description: z.string(),
  rarity: z.string().nullable(),
  requiresAttunement: z.boolean(),
  // 2024
  weaponMastery: z.string().nullable(),
});
export type SrdItem = z.infer<typeof SrdItemSchema>;
