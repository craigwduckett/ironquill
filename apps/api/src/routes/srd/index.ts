import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import * as srdService from '../../services/srd.js';

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
    return srdService.listSpecies(request.query.edition ?? '2024');
  });

  app.get('/species/:id', { schema: { params: IdParamSchema } }, async (request) => {
    return srdService.getSpeciesById(request.params.id);
  });

  // ── Classes ───────────────────────────────────────────────────────────────
  app.get('/classes', { schema: { querystring: EditionQuerySchema } }, async (request) => {
    return srdService.listClasses(request.query.edition ?? '2024');
  });

  app.get('/classes/:id', { schema: { params: IdParamSchema } }, async (request) => {
    return srdService.getClassById(request.params.id);
  });

  // ── Backgrounds ───────────────────────────────────────────────────────────
  app.get('/backgrounds', { schema: { querystring: EditionQuerySchema } }, async (request) => {
    return srdService.listBackgrounds(request.query.edition ?? '2024');
  });

  // ── Spells ────────────────────────────────────────────────────────────────
  app.get('/spells', { schema: { querystring: SpellQuerySchema } }, async (request) => {
    const q = request.query;
    return srdService.listSpells({
      edition: q.edition ?? '2024',
      name: q.name,
      level: q.level,
      school: q.school,
      concentration: q.concentration !== undefined ? q.concentration === 'true' : undefined,
      ritual: q.ritual !== undefined ? q.ritual === 'true' : undefined,
    });
  });

  app.get('/spells/:id', { schema: { params: IdParamSchema } }, async (request) => {
    return srdService.getSpellById(request.params.id);
  });

  // ── Monsters ──────────────────────────────────────────────────────────────
  app.get('/monsters', { schema: { querystring: MonsterQuerySchema } }, async (request) => {
    const q = request.query;
    return srdService.listMonsters({
      edition: q.edition ?? '2024',
      name: q.name,
      crMin: q.crMin,
      crMax: q.crMax,
      type: q.type,
      size: q.size,
    });
  });

  app.get('/monsters/:id', { schema: { params: IdParamSchema } }, async (request) => {
    return srdService.getMonsterById(request.params.id);
  });

  // ── Items ─────────────────────────────────────────────────────────────────
  app.get('/items', { schema: { querystring: EditionQuerySchema } }, async (request) => {
    return srdService.listItems(request.query.edition ?? '2024');
  });

  app.get('/items/:id', { schema: { params: IdParamSchema } }, async (request) => {
    return srdService.getItemById(request.params.id);
  });

  // ── Conditions ────────────────────────────────────────────────────────────
  app.get('/conditions', { schema: { querystring: EditionQuerySchema } }, async (request) => {
    return srdService.listConditions(request.query.edition ?? '2024');
  });

  app.get('/conditions/:id', { schema: { params: IdParamSchema } }, async (request) => {
    return srdService.getConditionById(request.params.id);
  });

  // ── Rules ─────────────────────────────────────────────────────────────────
  app.get('/rules', { schema: { querystring: RulesQuerySchema } }, async (request) => {
    const { q, category, edition } = request.query;
    return srdService.listRules({ edition: edition ?? '2024', q, category });
  });

  // ── Feats ─────────────────────────────────────────────────────────────────
  // 2024 SRD only: Origin feats (granted by backgrounds), General feats,
  // Fighting Style feats, and Epic Boon feats.
  app.get('/feats', { schema: { querystring: FeatQuerySchema } }, async (request) => {
    const { name, type, edition } = request.query;
    return srdService.listFeats({ edition: edition ?? '2024', name, type });
  });

  app.get('/feats/:id', { schema: { params: IdParamSchema } }, async (request) => {
    return srdService.getFeatById(request.params.id);
  });
};

export default srdRoutes;
