import type { AbilityScores } from '@ironquill/shared';

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export const WIZARD_STEPS: { step: WizardStep; label: string }[] = [
  { step: 1, label: 'Species' },
  { step: 2, label: 'Class' },
  { step: 3, label: 'Background' },
  { step: 4, label: 'Abilities' },
  { step: 5, label: 'Review' },
];

export type AbilityScoreMethod = 'standard' | 'pointbuy' | 'manual';

// Standard Array values per 5e rules
export const STANDARD_ARRAY: AbilityScores = {
  str: 15,
  dex: 14,
  con: 13,
  int: 12,
  wis: 10,
  cha: 8,
};

export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
export type AbilityKey = (typeof ABILITY_KEYS)[number];

export const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export const ALIGNMENTS = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
] as const;

// Point buy budget and costs per score (5e rules)
export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export type WizardDraft = {
  speciesId: string | null;
  classId: string | null;
  backgroundId: string | null;
  abilityScores: AbilityScores;
  abilityMethod: AbilityScoreMethod;
  name: string;
  alignment: string;
  personality: { traits: string; ideals: string; bonds: string; flaws: string };
  appearance: { age: string; height: string; description: string };
  notes: string;
};

export const INITIAL_DRAFT: WizardDraft = {
  speciesId: null,
  classId: null,
  backgroundId: null,
  abilityScores: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
  abilityMethod: 'standard',
  name: '',
  alignment: '',
  personality: { traits: '', ideals: '', bonds: '', flaws: '' },
  appearance: { age: '', height: '', description: '' },
  notes: '',
};

// Derive ability modifier from score
export function modifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(score: number): string {
  const mod = modifier(score);
  return mod >= 0 ? `+${mod}` : String(mod);
}

// Calculate total point buy cost spent
export function pointBuyCost(scores: AbilityScores): number {
  return ABILITY_KEYS.reduce((total, key) => {
    const cost = POINT_BUY_COSTS[scores[key]];
    return total + (cost ?? 0);
  }, 0);
}
