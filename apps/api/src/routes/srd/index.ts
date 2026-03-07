import { and, eq, gte, ilike, lte } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/client.js';
import {
  srdBackgrounds,
  srdClasses,
  srdConditions,
  srdItems,
  srdMonsters,
  srdRules,
  srdSpecies,
  srdSpells,
} from '../../db/schema/srd.js';

const IdParamSchema = z.object({ id: z.string().uuid() });

const SpellQuerySchema = z.object({
  name: z.string().optional(),
  level: z.coerce.number().int().min(0).max(9).optional(),
  school: z.string().optional(),
  concentration: z.enum(['true', 'false']).optional(),
  ritual: z.enum(['true', 'false']).optional(),
});

const MonsterQuerySchema = z.object({
  name: z.string().optional(),
  crMin: z.coerce.number().min(0).optional(),
  crMax: z.coerce.number().max(30).optional(),
  type: z.string().optional(),
  size: z.string().optional(),
});

const RulesQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
});

const srdRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // ── Species ───────────────────────────────────────────────────────────────
  // Response includes `displayTerm` ('Race' | 'Species') so the UI can label
  // this concept correctly per edition without branching on the URL.
  app.get('/species', async () => db.select().from(srdSpecies).orderBy(srdSpecies.name));

  app.get('/species/:id', { schema: { params: IdParamSchema } }, async (request) => {
    const rows = await db.select().from(srdSpecies).where(eq(srdSpecies.id, request.params.id));
    return rows[0] ?? null;
  });

  // ── Classes ───────────────────────────────────────────────────────────────
  app.get('/classes', async () => db.select().from(srdClasses).orderBy(srdClasses.name));

  app.get('/classes/:id', { schema: { params: IdParamSchema } }, async (request) => {
    const rows = await db.select().from(srdClasses).where(eq(srdClasses.id, request.params.id));
    return rows[0] ?? null;
  });

  // ── Backgrounds ───────────────────────────────────────────────────────────
  app.get('/backgrounds', async () =>
    db.select().from(srdBackgrounds).orderBy(srdBackgrounds.name),
  );

  // ── Spells ────────────────────────────────────────────────────────────────
  app.get('/spells', { schema: { querystring: SpellQuerySchema } }, async (request) => {
    const q = request.query;
    const conditions = [];
    if (q.name) conditions.push(ilike(srdSpells.name, `%${q.name}%`));
    if (q.level !== undefined) conditions.push(eq(srdSpells.level, q.level));
    if (q.school) conditions.push(ilike(srdSpells.school, q.school));
    if (q.concentration !== undefined)
      conditions.push(eq(srdSpells.concentration, q.concentration === 'true'));
    if (q.ritual !== undefined) conditions.push(eq(srdSpells.ritual, q.ritual === 'true'));

    const base = db.select().from(srdSpells).orderBy(srdSpells.level, srdSpells.name);
    return conditions.length > 0 ? base.where(and(...conditions)) : base;
  });

  app.get('/spells/:id', { schema: { params: IdParamSchema } }, async (request) => {
    const rows = await db.select().from(srdSpells).where(eq(srdSpells.id, request.params.id));
    return rows[0] ?? null;
  });

  // ── Monsters ──────────────────────────────────────────────────────────────
  app.get('/monsters', { schema: { querystring: MonsterQuerySchema } }, async (request) => {
    const q = request.query;
    const conditions = [];
    if (q.name) conditions.push(ilike(srdMonsters.name, `%${q.name}%`));
    if (q.crMin !== undefined) conditions.push(gte(srdMonsters.cr, q.crMin));
    if (q.crMax !== undefined) conditions.push(lte(srdMonsters.cr, q.crMax));
    if (q.type) conditions.push(ilike(srdMonsters.type, q.type));
    if (q.size) conditions.push(eq(srdMonsters.size, q.size));

    const base = db.select().from(srdMonsters).orderBy(srdMonsters.cr, srdMonsters.name);
    return conditions.length > 0 ? base.where(and(...conditions)) : base;
  });

  app.get('/monsters/:id', { schema: { params: IdParamSchema } }, async (request) => {
    const rows = await db.select().from(srdMonsters).where(eq(srdMonsters.id, request.params.id));
    return rows[0] ?? null;
  });

  // ── Items ─────────────────────────────────────────────────────────────────
  app.get('/items', async () => db.select().from(srdItems).orderBy(srdItems.name));

  app.get('/items/:id', { schema: { params: IdParamSchema } }, async (request) => {
    const rows = await db.select().from(srdItems).where(eq(srdItems.id, request.params.id));
    return rows[0] ?? null;
  });

  // ── Conditions ────────────────────────────────────────────────────────────
  app.get('/conditions', async () => db.select().from(srdConditions).orderBy(srdConditions.name));

  app.get('/conditions/:id', { schema: { params: IdParamSchema } }, async (request) => {
    const rows = await db
      .select()
      .from(srdConditions)
      .where(eq(srdConditions.id, request.params.id));
    return rows[0] ?? null;
  });

  // ── Rules ─────────────────────────────────────────────────────────────────
  app.get('/rules', { schema: { querystring: RulesQuerySchema } }, async (request) => {
    const { q, category } = request.query;
    const base = db.select().from(srdRules).orderBy(srdRules.category, srdRules.topic);
    if (category) return base.where(eq(srdRules.category, category));
    if (q) return base.where(ilike(srdRules.topic, `%${q}%`));
    return base;
  });
};

export default srdRoutes;
