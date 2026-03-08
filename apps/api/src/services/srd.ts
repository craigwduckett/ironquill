import { and, eq, gte, ilike, lte } from 'drizzle-orm';
import { db } from '../db/client.js';
import {
  srdBackgrounds,
  srdClasses,
  srdConditions,
  srdFeats,
  srdItems,
  srdMonsters,
  srdRules,
  srdSpecies,
  srdSpells,
} from '../db/schema/srd.js';

export type SrdEdition = '2014' | '2024';

export async function listSpecies(edition: SrdEdition) {
  return db
    .select()
    .from(srdSpecies)
    .where(eq(srdSpecies.sourceEdition, edition))
    .orderBy(srdSpecies.name);
}

export async function getSpeciesById(id: string) {
  const [row] = await db.select().from(srdSpecies).where(eq(srdSpecies.id, id)).limit(1);
  return row ?? null;
}

export async function listClasses(edition: SrdEdition) {
  return db
    .select()
    .from(srdClasses)
    .where(eq(srdClasses.sourceEdition, edition))
    .orderBy(srdClasses.name);
}

export async function getClassById(id: string) {
  const [row] = await db.select().from(srdClasses).where(eq(srdClasses.id, id)).limit(1);
  return row ?? null;
}

export async function listBackgrounds(edition: SrdEdition) {
  return db
    .select()
    .from(srdBackgrounds)
    .where(eq(srdBackgrounds.sourceEdition, edition))
    .orderBy(srdBackgrounds.name);
}

export type SpellFilters = {
  edition: SrdEdition;
  name?: string | undefined;
  level?: number | undefined;
  school?: string | undefined;
  concentration?: boolean | undefined;
  ritual?: boolean | undefined;
};

export async function listSpells(filters: SpellFilters) {
  const conditions = [eq(srdSpells.sourceEdition, filters.edition)];
  if (filters.name) conditions.push(ilike(srdSpells.name, `%${filters.name}%`));
  if (filters.level !== undefined) conditions.push(eq(srdSpells.level, filters.level));
  if (filters.school) conditions.push(ilike(srdSpells.school, filters.school));
  if (filters.concentration !== undefined)
    conditions.push(eq(srdSpells.concentration, filters.concentration));
  if (filters.ritual !== undefined) conditions.push(eq(srdSpells.ritual, filters.ritual));

  return db
    .select()
    .from(srdSpells)
    .where(and(...conditions))
    .orderBy(srdSpells.level, srdSpells.name);
}

export async function getSpellById(id: string) {
  const [row] = await db.select().from(srdSpells).where(eq(srdSpells.id, id)).limit(1);
  return row ?? null;
}

export type MonsterFilters = {
  edition: SrdEdition;
  name?: string | undefined;
  crMin?: number | undefined;
  crMax?: number | undefined;
  type?: string | undefined;
  size?: string | undefined;
};

export async function listMonsters(filters: MonsterFilters) {
  const conditions = [eq(srdMonsters.sourceEdition, filters.edition)];
  if (filters.name) conditions.push(ilike(srdMonsters.name, `%${filters.name}%`));
  if (filters.crMin !== undefined) conditions.push(gte(srdMonsters.cr, filters.crMin));
  if (filters.crMax !== undefined) conditions.push(lte(srdMonsters.cr, filters.crMax));
  if (filters.type) conditions.push(ilike(srdMonsters.type, filters.type));
  if (filters.size) conditions.push(eq(srdMonsters.size, filters.size));

  return db
    .select()
    .from(srdMonsters)
    .where(and(...conditions))
    .orderBy(srdMonsters.cr, srdMonsters.name);
}

export async function getMonsterById(id: string) {
  const [row] = await db.select().from(srdMonsters).where(eq(srdMonsters.id, id)).limit(1);
  return row ?? null;
}

export async function listItems(edition: SrdEdition) {
  return db
    .select()
    .from(srdItems)
    .where(eq(srdItems.sourceEdition, edition))
    .orderBy(srdItems.name);
}

export async function getItemById(id: string) {
  const [row] = await db.select().from(srdItems).where(eq(srdItems.id, id)).limit(1);
  return row ?? null;
}

export async function listConditions(edition: SrdEdition) {
  return db
    .select()
    .from(srdConditions)
    .where(eq(srdConditions.sourceEdition, edition))
    .orderBy(srdConditions.name);
}

export async function getConditionById(id: string) {
  const [row] = await db.select().from(srdConditions).where(eq(srdConditions.id, id)).limit(1);
  return row ?? null;
}

export type RulesFilters = {
  edition: SrdEdition;
  q?: string | undefined;
  category?: string | undefined;
};

export async function listRules(filters: RulesFilters) {
  const conditions = [eq(srdRules.sourceEdition, filters.edition)];
  if (filters.category) conditions.push(eq(srdRules.category, filters.category));
  if (filters.q) conditions.push(ilike(srdRules.topic, `%${filters.q}%`));

  return db
    .select()
    .from(srdRules)
    .where(and(...conditions))
    .orderBy(srdRules.category, srdRules.topic);
}

export type FeatFilters = {
  edition: SrdEdition;
  name?: string | undefined;
  type?: 'origin' | 'general' | 'fighting-style' | 'epic-boon' | undefined;
};

export async function listFeats(filters: FeatFilters) {
  const conditions = [eq(srdFeats.sourceEdition, filters.edition)];
  if (filters.name) conditions.push(ilike(srdFeats.name, `%${filters.name}%`));
  if (filters.type) conditions.push(eq(srdFeats.type, filters.type));

  return db
    .select()
    .from(srdFeats)
    .where(and(...conditions))
    .orderBy(srdFeats.type, srdFeats.name);
}

export async function getFeatById(id: string) {
  const [row] = await db.select().from(srdFeats).where(eq(srdFeats.id, id)).limit(1);
  return row ?? null;
}
