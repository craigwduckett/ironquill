import { and, eq, gte, ilike, lte } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/client.js';
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
} from '../../db/schema/srd.js';

const IdParamSchema = z.object({ id: z.string().uuid() });

// Edition filter shared by all SRD list routes. Defaults to '2024'.
const EditionQuerySchema = z.object({
  edition: z.enum(['2014', '2024']).default('2024').optional(),
});

const SpellQuerySchema = EditionQuerySchema.extend({
  name: z.string().optional(),
  level: z.coerce.number().int().min(0).max(9).optional(),
  school: z.string().optional(),
  concentration: z.enum(['true', 'false']).optional(),
  ritual: z.enum(['true', 'false']).optional(),
});

const MonsterQuerySchema = EditionQuerySchema.extend({
  name: z.string().optional(),
  crMin: z.coerce.number().min(0).optional(),
  crMax: z.coerce.number().max(30).optional(),
  type: z.string().optional(),
  size: z.string().optional(),
});

const RulesQuerySchema = EditionQuerySchema.extend({
  q: z.string().optional(),
  category: z.string().optional(),
});

const FeatQuerySchema = EditionQuerySchema.extend({
  name: z.string().optional(),
  type: z.enum(['origin', 'general', 'fighting-style', 'epic-boon']).optional(),
});

const srdRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // TanStack Query manages client-side caching; disable browser HTTP caching
  // to prevent stale error responses from persisting after server-side fixes.
  app.addHook('onSend', (_request, reply, _payload, done) => {
    reply.header('Cache-Control', 'no-store');
    done();
  });

  // ── Species ───────────────────────────────────────────────────────────────
  // Response includes `displayTerm` ('Race' | 'Species') so the UI can label
  // this concept correctly per edition without branching on the URL.
  app.get('/species', { schema: { querystring: EditionQuerySchema } }, async (request) => {
    const edition = request.query.edition ?? '2024';
    return db
      .select()
      .from(srdSpecies)
      .where(eq(srdSpecies.sourceEdition, edition))
      .orderBy(srdSpecies.name);
  });

  app.get('/species/:id', { schema: { params: IdParamSchema } }, async (request) => {
    const rows = await db.select().from(srdSpecies).where(eq(srdSpecies.id, request.params.id));
    return rows[0] ?? null;
  });

  // ── Classes ───────────────────────────────────────────────────────────────
  app.get('/classes', { schema: { querystring: EditionQuerySchema } }, async (request) => {
    const edition = request.query.edition ?? '2024';
    return db
      .select()
      .from(srdClasses)
      .where(eq(srdClasses.sourceEdition, edition))
      .orderBy(srdClasses.name);
  });

  app.get('/classes/:id', { schema: { params: IdParamSchema } }, async (request) => {
    const rows = await db.select().from(srdClasses).where(eq(srdClasses.id, request.params.id));
    return rows[0] ?? null;
  });

  // ── Backgrounds ───────────────────────────────────────────────────────────
  app.get('/backgrounds', { schema: { querystring: EditionQuerySchema } }, async (request) => {
    const edition = request.query.edition ?? '2024';
    return db
      .select()
      .from(srdBackgrounds)
      .where(eq(srdBackgrounds.sourceEdition, edition))
      .orderBy(srdBackgrounds.name);
  });

  // ── Spells ────────────────────────────────────────────────────────────────
  app.get('/spells', { schema: { querystring: SpellQuerySchema } }, async (request) => {
    const q = request.query;
    const edition = q.edition ?? '2024';
    const conditions = [eq(srdSpells.sourceEdition, edition)];
    if (q.name) conditions.push(ilike(srdSpells.name, `%${q.name}%`));
    if (q.level !== undefined) conditions.push(eq(srdSpells.level, q.level));
    if (q.school) conditions.push(ilike(srdSpells.school, q.school));
    if (q.concentration !== undefined)
      conditions.push(eq(srdSpells.concentration, q.concentration === 'true'));
    if (q.ritual !== undefined) conditions.push(eq(srdSpells.ritual, q.ritual === 'true'));

    return db
      .select()
      .from(srdSpells)
      .where(and(...conditions))
      .orderBy(srdSpells.level, srdSpells.name);
  });

  app.get('/spells/:id', { schema: { params: IdParamSchema } }, async (request) => {
    const rows = await db.select().from(srdSpells).where(eq(srdSpells.id, request.params.id));
    return rows[0] ?? null;
  });

  // ── Monsters ──────────────────────────────────────────────────────────────
  app.get('/monsters', { schema: { querystring: MonsterQuerySchema } }, async (request) => {
    const q = request.query;
    const edition = q.edition ?? '2024';
    const conditions = [eq(srdMonsters.sourceEdition, edition)];
    if (q.name) conditions.push(ilike(srdMonsters.name, `%${q.name}%`));
    if (q.crMin !== undefined) conditions.push(gte(srdMonsters.cr, q.crMin));
    if (q.crMax !== undefined) conditions.push(lte(srdMonsters.cr, q.crMax));
    if (q.type) conditions.push(ilike(srdMonsters.type, q.type));
    if (q.size) conditions.push(eq(srdMonsters.size, q.size));

    return db
      .select()
      .from(srdMonsters)
      .where(and(...conditions))
      .orderBy(srdMonsters.cr, srdMonsters.name);
  });

  app.get('/monsters/:id', { schema: { params: IdParamSchema } }, async (request) => {
    const rows = await db.select().from(srdMonsters).where(eq(srdMonsters.id, request.params.id));
    return rows[0] ?? null;
  });

  // ── Items ─────────────────────────────────────────────────────────────────
  app.get('/items', { schema: { querystring: EditionQuerySchema } }, async (request) => {
    const edition = request.query.edition ?? '2024';
    return db
      .select()
      .from(srdItems)
      .where(eq(srdItems.sourceEdition, edition))
      .orderBy(srdItems.name);
  });

  app.get('/items/:id', { schema: { params: IdParamSchema } }, async (request) => {
    const rows = await db.select().from(srdItems).where(eq(srdItems.id, request.params.id));
    return rows[0] ?? null;
  });

  // ── Conditions ────────────────────────────────────────────────────────────
  app.get('/conditions', { schema: { querystring: EditionQuerySchema } }, async (request) => {
    const edition = request.query.edition ?? '2024';
    return db
      .select()
      .from(srdConditions)
      .where(eq(srdConditions.sourceEdition, edition))
      .orderBy(srdConditions.name);
  });

  app.get('/conditions/:id', { schema: { params: IdParamSchema } }, async (request) => {
    const rows = await db
      .select()
      .from(srdConditions)
      .where(eq(srdConditions.id, request.params.id));
    return rows[0] ?? null;
  });

  // ── Rules ─────────────────────────────────────────────────────────────────
  app.get('/rules', { schema: { querystring: RulesQuerySchema } }, async (request) => {
    const { q, category, edition } = request.query;
    const activeEdition = edition ?? '2024';
    const conditions = [eq(srdRules.sourceEdition, activeEdition)];
    if (category) conditions.push(eq(srdRules.category, category));
    if (q) conditions.push(ilike(srdRules.topic, `%${q}%`));
    return db
      .select()
      .from(srdRules)
      .where(and(...conditions))
      .orderBy(srdRules.category, srdRules.topic);
  });

  // ── Feats ─────────────────────────────────────────────────────────────────
  // 2024 SRD only: Origin feats (granted by backgrounds), General feats,
  // Fighting Style feats, and Epic Boon feats.
  app.get('/feats', { schema: { querystring: FeatQuerySchema } }, async (request) => {
    const { name, type, edition } = request.query;
    const activeEdition = edition ?? '2024';
    const conditions = [eq(srdFeats.sourceEdition, activeEdition)];
    if (name) conditions.push(ilike(srdFeats.name, `%${name}%`));
    if (type) conditions.push(eq(srdFeats.type, type));
    return db
      .select()
      .from(srdFeats)
      .where(and(...conditions))
      .orderBy(srdFeats.type, srdFeats.name);
  });

  app.get('/feats/:id', { schema: { params: IdParamSchema } }, async (request) => {
    const rows = await db.select().from(srdFeats).where(eq(srdFeats.id, request.params.id));
    return rows[0] ?? null;
  });
};

export default srdRoutes;
