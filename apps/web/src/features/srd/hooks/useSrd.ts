import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api.js';

// ── Types mirror the Drizzle schema inferSelect shapes ────────────────────────

export type SrdEdition = '2014' | '2024';

export type SrdSpecies = {
  id: string;
  sourceEdition: SrdEdition;
  displayTerm: 'Race' | 'Species';
  name: string;
  description: string | null;
  traits: Array<{ name: string; description: string }>;
  abilityBonuses: Partial<Record<string, number>>;
  languages: string[];
  languageDesc: string | null;
  speed: number;
  size: string;
};

export type SrdClass = {
  id: string;
  sourceEdition: SrdEdition;
  name: string;
  description: string | null;
  hitDie: string;
  primaryAbilities: string[];
  savingThrows: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  skillChoices: { choose: number; from: string[] } | null;
  featuresByLevel: Array<{
    level: number;
    features: Array<{ name: string; description: string }>;
  }>;
  spellcastingInfo: Record<string, unknown> | null;
  startingEquipment: Array<Record<string, unknown>>;
};

export type SrdBackground = {
  id: string;
  sourceEdition: SrdEdition;
  name: string;
  description: string | null;
  skillProficiencies: string[];
  toolProficiencies: string[];
  languagesCount: number;
  equipment: Array<Record<string, unknown>>;
  featureName: string;
  featureDescription: string;
};

export type SrdSpell = {
  id: string;
  sourceEdition: SrdEdition;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: { verbal: boolean; somatic: boolean; material: string | null };
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higherLevels: string | null;
  classes: string[];
};

export type SrdMonster = {
  id: string;
  sourceEdition: SrdEdition;
  name: string;
  size: string;
  type: string;
  alignment: string;
  ac: number;
  acType: string | null;
  hp: number;
  hpFormula: string;
  speed: Record<string, number | string>;
  abilityScores: Record<string, number>;
  savingThrows: Record<string, number> | null;
  skills: Record<string, number> | null;
  damageResistances: string[] | null;
  damageImmunities: string[] | null;
  conditionImmunities: string[] | null;
  senses: string;
  languages: string;
  cr: number;
  xp: number;
  actions: Array<Record<string, unknown>>;
  legendaryActions: Array<Record<string, unknown>> | null;
  specialAbilities: Array<Record<string, unknown>> | null;
};

export type SrdItem = {
  id: string;
  sourceEdition: SrdEdition;
  name: string;
  category: 'weapon' | 'armor' | 'adventuring_gear' | 'tool' | 'magic_item';
  cost: { amount: number; unit: string } | null;
  weight: number | null;
  properties: Record<string, unknown> | null;
  description: string;
  rarity: string | null;
  requiresAttunement: boolean;
};

export type SrdCondition = {
  id: string;
  sourceEdition: SrdEdition;
  name: string;
  description: string;
  mechanicalEffects: string[];
};

export type SrdRule = {
  id: string;
  sourceEdition: SrdEdition;
  category: string;
  topic: string;
  description: string;
  keywords: string[];
};

// ── Query hooks ───────────────────────────────────────────────────────────────

export const srdKeys = {
  species: () => ['srd', 'species'] as const,
  speciesDetail: (id: string) => ['srd', 'species', id] as const,
  classes: () => ['srd', 'classes'] as const,
  classDetail: (id: string) => ['srd', 'classes', id] as const,
  backgrounds: () => ['srd', 'backgrounds'] as const,
  spells: (params?: Record<string, string>) => ['srd', 'spells', params ?? {}] as const,
  spellDetail: (id: string) => ['srd', 'spells', id] as const,
  monsters: (params?: Record<string, string>) => ['srd', 'monsters', params ?? {}] as const,
  monsterDetail: (id: string) => ['srd', 'monsters', id] as const,
  items: () => ['srd', 'items'] as const,
  itemDetail: (id: string) => ['srd', 'items', id] as const,
  conditions: () => ['srd', 'conditions'] as const,
  conditionDetail: (id: string) => ['srd', 'conditions', id] as const,
  rules: (params?: Record<string, string>) => ['srd', 'rules', params ?? {}] as const,
};

function buildQuery(params?: Record<string, string | undefined>) {
  if (!params) return '';
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString();
  return qs ? `?${qs}` : '';
}

export function useSrdSpecies() {
  return useQuery({
    queryKey: srdKeys.species(),
    queryFn: () => api.get<SrdSpecies[]>('/srd/species'),
    staleTime: 1000 * 60 * 60, // SRD data is stable — cache 1 hour
  });
}

export function useSrdSpeciesDetail(id: string) {
  return useQuery({
    queryKey: srdKeys.speciesDetail(id),
    queryFn: () => api.get<SrdSpecies>(`/srd/species/${id}`),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 60,
  });
}

export function useSrdClasses() {
  return useQuery({
    queryKey: srdKeys.classes(),
    queryFn: () => api.get<SrdClass[]>('/srd/classes'),
    staleTime: 1000 * 60 * 60,
  });
}

export function useSrdClassDetail(id: string) {
  return useQuery({
    queryKey: srdKeys.classDetail(id),
    queryFn: () => api.get<SrdClass>(`/srd/classes/${id}`),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 60,
  });
}

export function useSrdBackgrounds() {
  return useQuery({
    queryKey: srdKeys.backgrounds(),
    queryFn: () => api.get<SrdBackground[]>('/srd/backgrounds'),
    staleTime: 1000 * 60 * 60,
  });
}

export function useSrdSpells(params?: { name?: string; level?: string; school?: string }) {
  return useQuery({
    queryKey: srdKeys.spells(params as Record<string, string> | undefined),
    queryFn: () => api.get<SrdSpell[]>(`/srd/spells${buildQuery(params)}`),
    staleTime: 1000 * 60 * 60,
  });
}

export function useSrdSpellDetail(id: string) {
  return useQuery({
    queryKey: srdKeys.spellDetail(id),
    queryFn: () => api.get<SrdSpell>(`/srd/spells/${id}`),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 60,
  });
}

export function useSrdMonsters(params?: {
  name?: string;
  crMin?: string;
  crMax?: string;
  type?: string;
}) {
  return useQuery({
    queryKey: srdKeys.monsters(params as Record<string, string> | undefined),
    queryFn: () => api.get<SrdMonster[]>(`/srd/monsters${buildQuery(params)}`),
    staleTime: 1000 * 60 * 60,
  });
}

export function useSrdMonsterDetail(id: string) {
  return useQuery({
    queryKey: srdKeys.monsterDetail(id),
    queryFn: () => api.get<SrdMonster>(`/srd/monsters/${id}`),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 60,
  });
}

export function useSrdItems() {
  return useQuery({
    queryKey: srdKeys.items(),
    queryFn: () => api.get<SrdItem[]>('/srd/items'),
    staleTime: 1000 * 60 * 60,
  });
}

export function useSrdConditions() {
  return useQuery({
    queryKey: srdKeys.conditions(),
    queryFn: () => api.get<SrdCondition[]>('/srd/conditions'),
    staleTime: 1000 * 60 * 60,
  });
}

export function useSrdRules(params?: { q?: string; category?: string }) {
  return useQuery({
    queryKey: srdKeys.rules(params as Record<string, string> | undefined),
    queryFn: () => api.get<SrdRule[]>(`/srd/rules${buildQuery(params)}`),
    staleTime: 1000 * 60 * 60,
  });
}
