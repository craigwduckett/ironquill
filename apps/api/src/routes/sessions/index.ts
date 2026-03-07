import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import * as sessionService from '../../services/sessions.js';

export default async function sessionRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // List sessions for an adventure (DM only)
  server.get(
    '/adventure/:adventureId',
    {
      onRequest: [app.authenticate],
      schema: {
        params: z.object({ adventureId: z.string().uuid() }),
      },
    },
    async (req) => {
      return sessionService.listByAdventure(req.params.adventureId, req.user.sub);
    },
  );

  // Create a new session for an adventure (DM only)
  server.post(
    '/adventure/:adventureId',
    {
      onRequest: [app.authenticate],
      schema: {
        params: z.object({ adventureId: z.string().uuid() }),
      },
    },
    async (req, reply) => {
      const session = await sessionService.create(req.params.adventureId, req.user.sub);
      return reply.status(201).send(session);
    },
  );

  // Get a specific session (DM or player)
  server.get(
    '/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        params: z.object({ id: z.string().uuid() }),
      },
    },
    async (req) => {
      return sessionService.getById(req.params.id, req.user.sub);
    },
  );

  // Start a session (DM only)
  server.post(
    '/:id/start',
    {
      onRequest: [app.authenticate],
      schema: {
        params: z.object({ id: z.string().uuid() }),
      },
    },
    async (req) => {
      return sessionService.start(req.params.id, req.user.sub);
    },
  );

  // Pause a session (DM only)
  server.post(
    '/:id/pause',
    {
      onRequest: [app.authenticate],
      schema: {
        params: z.object({ id: z.string().uuid() }),
      },
    },
    async (req) => {
      return sessionService.pause(req.params.id, req.user.sub);
    },
  );

  // End a session (DM only)
  server.post(
    '/:id/end',
    {
      onRequest: [app.authenticate],
      schema: {
        params: z.object({ id: z.string().uuid() }),
        body: z.object({ summary: z.string().optional() }),
      },
    },
    async (req) => {
      return sessionService.end(req.params.id, req.user.sub, req.body.summary);
    },
  );

  // Change current scene (DM only) — emits scene:change WS event
  server.put(
    '/:id/scene',
    {
      onRequest: [app.authenticate],
      schema: {
        params: z.object({ id: z.string().uuid() }),
        body: z.object({ sceneId: z.string().uuid() }),
      },
    },
    async (req) => {
      const session = await sessionService.setScene(req.params.id, req.body.sceneId, req.user.sub);
      app.io.to(`session:${req.params.id}`).emit('scene:change', {
        sceneId: req.body.sceneId,
        narrativeReadAloud: null,
      });
      return session;
    },
  );

  // Get combat state
  server.get(
    '/:id/combat',
    {
      onRequest: [app.authenticate],
      schema: {
        params: z.object({ id: z.string().uuid() }),
      },
    },
    async (req) => {
      return sessionService.getCombat(req.params.id, req.user.sub);
    },
  );

  // Start or reset combat (DM only) — emits initiative:update
  server.post(
    '/:id/combat/start',
    {
      onRequest: [app.authenticate],
      schema: {
        params: z.object({ id: z.string().uuid() }),
        body: z.object({
          initiativeOrder: z.array(
            z.object({
              id: z.string(),
              label: z.string(),
              initiative: z.number().int(),
              characterId: z.string().uuid().nullable(),
              npcId: z.string().uuid().nullable(),
              isCurrent: z.boolean(),
            }),
          ),
        }),
      },
    },
    async (req) => {
      const combat = await sessionService.startCombat(
        req.params.id,
        req.user.sub,
        req.body.initiativeOrder,
      );
      app.io.to(`session:${req.params.id}`).emit('initiative:update', {
        entries: combat.initiativeOrder.map((e) => ({
          characterId: e.characterId,
          npcId: e.npcId,
          value: e.initiative,
          isCurrent: e.isCurrent,
        })),
      });
      return combat;
    },
  );

  // Advance turn (DM only) — emits turn:advance
  server.post(
    '/:id/combat/advance',
    {
      onRequest: [app.authenticate],
      schema: {
        params: z.object({ id: z.string().uuid() }),
      },
    },
    async (req) => {
      const combat = await sessionService.advanceTurn(req.params.id, req.user.sub);
      const current = combat.initiativeOrder.find((e) => e.isCurrent);
      app.io.to(`session:${req.params.id}`).emit('turn:advance', {
        currentCharacterId: current?.characterId ?? null,
        round: combat.round,
      });
      return combat;
    },
  );

  // End combat (DM only)
  server.delete(
    '/:id/combat',
    {
      onRequest: [app.authenticate],
      schema: {
        params: z.object({ id: z.string().uuid() }),
      },
    },
    async (req, reply) => {
      await sessionService.endCombat(req.params.id, req.user.sub);
      return reply.status(204).send();
    },
  );
}
