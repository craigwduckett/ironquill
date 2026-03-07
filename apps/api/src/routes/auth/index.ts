import { LoginSchema, RegisterSchema } from '@ironquill/shared';
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { env } from '../../lib/env.js';
import * as authService from '../../services/auth.js';

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;
const ACCESS_TOKEN_TTL = '15m';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/register', { schema: { body: RegisterSchema } }, async (request, reply) => {
    const user = await authService.register(request.body);
    const accessToken = app.jwt.sign(
      { sub: user.id, email: user.email, displayName: user.displayName },
      { expiresIn: ACCESS_TOKEN_TTL },
    );
    const refreshToken = app.jwt.sign(
      { sub: user.id, email: user.email, displayName: user.displayName },
      { expiresIn: '7d' },
    );
    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: '/auth/refresh',
    });
    return reply.code(201).send({ accessToken, user });
  });

  app.post('/login', { schema: { body: LoginSchema } }, async (request, reply) => {
    const user = await authService.verifyCredentials(request.body);
    const accessToken = app.jwt.sign(
      { sub: user.id, email: user.email, displayName: user.displayName },
      { expiresIn: ACCESS_TOKEN_TTL },
    );
    const refreshToken = app.jwt.sign(
      { sub: user.id, email: user.email, displayName: user.displayName },
      { expiresIn: '7d' },
    );
    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: '/auth/refresh',
    });
    return reply.send({ accessToken, user });
  });

  app.post('/logout', async (_request, reply) => {
    reply.clearCookie('refreshToken', { path: '/auth/refresh' });
    return reply.send({ success: true });
  });
};

export default authRoutes;
