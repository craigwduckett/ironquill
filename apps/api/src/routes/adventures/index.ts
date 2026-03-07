import {
  AdventureCreateSchema,
  AdventureUpdateSchema,
  SceneCreateSchema,
  SceneNpcCreateSchema,
  SceneUpdateSchema,
} from '@ironquill/shared';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import * as adventureService from '../../services/adventures.js';

const IdParamSchema = z.object({ id: z.string().uuid() });
const AdventureSceneParamSchema = z.object({
  id: z.string().uuid(),
  sceneId: z.string().uuid(),
});

const adventureRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // ── Adventures ────────────────────────────────────────────────────────────

  app.get('/', { preHandler: [app.authenticate] }, async (request) =>
    adventureService.listByOwner(request.user.sub),
  );

  app.get(
    '/:id',
    { preHandler: [app.authenticate], schema: { params: IdParamSchema } },
    async (request) => adventureService.getById(request.params.id, request.user.sub),
  );

  app.post(
    '/',
    { preHandler: [app.authenticate], schema: { body: AdventureCreateSchema } },
    async (request, reply) => {
      const adventure = await adventureService.create(request.user.sub, request.body);
      return reply.code(201).send(adventure);
    },
  );

  app.patch(
    '/:id',
    {
      preHandler: [app.authenticate],
      schema: { params: IdParamSchema, body: AdventureUpdateSchema },
    },
    async (request) => adventureService.update(request.params.id, request.user.sub, request.body),
  );

  app.delete(
    '/:id',
    { preHandler: [app.authenticate], schema: { params: IdParamSchema } },
    async (request, reply) => {
      await adventureService.remove(request.params.id, request.user.sub);
      return reply.code(204).send();
    },
  );

  // ── Invite code ───────────────────────────────────────────────────────────

  app.post(
    '/:id/invite',
    { preHandler: [app.authenticate], schema: { params: IdParamSchema } },
    async (request) => adventureService.generateInvite(request.params.id, request.user.sub),
  );

  app.post(
    '/join',
    {
      preHandler: [app.authenticate],
      schema: {
        body: z.object({
          inviteCode: z.string().min(1),
          characterId: z.string().uuid().optional(),
        }),
      },
    },
    async (request, reply) => {
      const result = await adventureService.joinByInviteCode(
        request.body.inviteCode,
        request.user.sub,
        request.body.characterId,
      );
      return reply.code(201).send(result);
    },
  );

  // ── Scenes ────────────────────────────────────────────────────────────────

  app.get(
    '/:id/scenes',
    { preHandler: [app.authenticate], schema: { params: IdParamSchema } },
    async (request) => adventureService.listScenes(request.params.id, request.user.sub),
  );

  app.post(
    '/:id/scenes',
    {
      preHandler: [app.authenticate],
      schema: { params: IdParamSchema, body: SceneCreateSchema },
    },
    async (request, reply) => {
      const scene = await adventureService.createScene(
        request.params.id,
        request.user.sub,
        request.body,
      );
      return reply.code(201).send(scene);
    },
  );

  app.patch(
    '/:id/scenes/:sceneId',
    {
      preHandler: [app.authenticate],
      schema: { params: AdventureSceneParamSchema, body: SceneUpdateSchema },
    },
    async (request) =>
      adventureService.updateScene(
        request.params.id,
        request.params.sceneId,
        request.user.sub,
        request.body,
      ),
  );

  app.delete(
    '/:id/scenes/:sceneId',
    {
      preHandler: [app.authenticate],
      schema: { params: AdventureSceneParamSchema },
    },
    async (request, reply) => {
      await adventureService.removeScene(
        request.params.id,
        request.params.sceneId,
        request.user.sub,
      );
      return reply.code(204).send();
    },
  );

  // ── NPCs ──────────────────────────────────────────────────────────────────

  app.get(
    '/:id/npcs',
    { preHandler: [app.authenticate], schema: { params: IdParamSchema } },
    async (request) => adventureService.listNpcs(request.params.id, request.user.sub),
  );

  app.post(
    '/:id/scenes/:sceneId/npcs',
    {
      preHandler: [app.authenticate],
      schema: { params: AdventureSceneParamSchema, body: SceneNpcCreateSchema },
    },
    async (request, reply) => {
      const npc = await adventureService.createNpc(
        request.params.id,
        request.params.sceneId,
        request.user.sub,
        request.body,
      );
      return reply.code(201).send(npc);
    },
  );
};

export default adventureRoutes;
