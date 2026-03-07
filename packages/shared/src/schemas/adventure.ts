import { z } from 'zod';

export const AdventureTypeSchema = z.enum(['campaign', 'one_shot']);
export const RulesetSchema = z.enum(['standard', 'kids', 'custom']);
export const AdventureStatusSchema = z.enum(['draft', 'published', 'active', 'completed']);

export const RulesetOverridesSchema = z.object({
  simplifiedRolls: z.boolean().default(true),
  weakerEnemies: z.boolean().default(true),
  forgivingCombat: z.boolean().default(true),
  simplifiedSpellcasting: z.boolean().default(true),
  streamlinedInventory: z.boolean().default(true),
});

export const AdventureCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  setting: z.string().optional(),
  levelRangeMin: z.number().int().min(1).max(20).default(1),
  levelRangeMax: z.number().int().min(1).max(20).default(5),
  adventureType: AdventureTypeSchema,
  ruleset: RulesetSchema.default('standard'),
  rulesetOverrides: RulesetOverridesSchema.optional(),
  playerCapacityMin: z.number().int().min(1).default(1),
  playerCapacityMax: z.number().int().min(1).max(10).default(6),
});

export const AdventureUpdateSchema = AdventureCreateSchema.partial().extend({
  status: AdventureStatusSchema.optional(),
  coverImageId: z.string().optional(),
});

export type AdventureType = z.infer<typeof AdventureTypeSchema>;
export type Ruleset = z.infer<typeof RulesetSchema>;
export type AdventureStatus = z.infer<typeof AdventureStatusSchema>;
export type RulesetOverrides = z.infer<typeof RulesetOverridesSchema>;
export type AdventureCreateInput = z.infer<typeof AdventureCreateSchema>;
export type AdventureUpdateInput = z.infer<typeof AdventureUpdateSchema>;
