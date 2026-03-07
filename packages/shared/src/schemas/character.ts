import { z } from 'zod';

export const AbilityScoresSchema = z.object({
  str: z.number().int().min(1).max(30),
  dex: z.number().int().min(1).max(30),
  con: z.number().int().min(1).max(30),
  int: z.number().int().min(1).max(30),
  wis: z.number().int().min(1).max(30),
  cha: z.number().int().min(1).max(30),
});

export const PersonalitySchema = z.object({
  traits: z.string(),
  ideals: z.string(),
  bonds: z.string(),
  flaws: z.string(),
});

export const AppearanceSchema = z.object({
  age: z.string().optional(),
  height: z.string().optional(),
  description: z.string().optional(),
});

export const CharacterCreateSchema = z.object({
  name: z.string().min(1).max(100),
  speciesId: z.string().uuid(),
  classId: z.string().uuid(),
  backgroundId: z.string().uuid().optional(),
  level: z.number().int().min(1).max(20).default(1),
  abilityScores: AbilityScoresSchema,
  alignment: z.string().max(30).optional(),
  personality: PersonalitySchema.optional(),
  appearance: AppearanceSchema.optional(),
  portraitId: z.string().optional(),
  notes: z.string().optional(),
});

export const CharacterUpdateSchema = CharacterCreateSchema.partial().extend({
  hpCurrent: z.number().int().min(0).optional(),
  hpMax: z.number().int().min(0).optional(),
  hpTemp: z.number().int().min(0).optional(),
  xp: z.number().int().min(0).optional(),
  ac: z.number().int().min(0).optional(),
  speed: z.number().int().min(0).optional(),
  proficiencyBonus: z.number().int().min(1).max(6).optional(),
  skillProficiencies: z.array(z.string()).optional(),
});

export type AbilityScores = z.infer<typeof AbilityScoresSchema>;
export type Personality = z.infer<typeof PersonalitySchema>;
export type Appearance = z.infer<typeof AppearanceSchema>;
export type CharacterCreateInput = z.infer<typeof CharacterCreateSchema>;
export type CharacterUpdateInput = z.infer<typeof CharacterUpdateSchema>;
