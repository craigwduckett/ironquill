import rateLimit from '@fastify/rate-limit';
import { LoginSchema, RegisterSchema } from '@ironquill/shared';
import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { AppError } from '../../lib/errors.js';
import { refreshTokens } from '../../lib/refreshToken.js';
import * as authService from '../../services/auth.js';

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/auth/refresh';

type TokenPayload = { sub: string; email: string; displayName: string };

function buildAccessToken(
  app: Parameters<FastifyPluginAsync>[0],
  user: { id: string; email: string; displayName: string },
) {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    displayName: user.displayName,
  };
  const accessToken = app.jwt.sign(payload, { expiresIn: ACCESS_TOKEN_TTL });
  return { accessToken, payload };
}

async function setRefreshCookie(reply: FastifyReply, payload: TokenPayload) {
  const refreshToken = await refreshTokens.sign(payload);
  reply.setCookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: REFRESH_COOKIE_PATH,
  });
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // 10 requests per minute per IP — blocks brute-force and credential-stuffing
  await fastify.register(rateLimit, {
    max: 10,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'TOO_MANY_REQUESTS',
      message: 'Too many attempts. Please wait a minute and try again.',
    }),
  });

  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/register', { schema: { body: RegisterSchema } }, async (request, reply) => {
    const user = await authService.register(request.body);
    const { accessToken, payload } = buildAccessToken(app, user);
    await setRefreshCookie(reply, payload);
    return reply.code(201).send({
      accessToken,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  });

  app.post('/login', { schema: { body: LoginSchema } }, async (request, reply) => {
    const user = await authService.verifyCredentials(request.body);
    const { accessToken, payload } = buildAccessToken(app, user);
    await setRefreshCookie(reply, payload);
    return reply.send({ accessToken, user });
  });

  // Consumes the httpOnly refresh cookie and issues a new access token.
  // Signed with JWT_REFRESH_SECRET — separate secret from access tokens.
  // Rotates the refresh cookie on every successful call.
  app.post('/refresh', async (request, reply) => {
    const token = request.cookies[REFRESH_COOKIE_NAME];
    if (!token) throw AppError.unauthorized('No refresh token');

    let refreshPayload: TokenPayload;
    try {
      refreshPayload = await refreshTokens.verify(token);
    } catch {
      reply.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    const user = await authService.getUserById(refreshPayload.sub);
    const { accessToken, payload } = buildAccessToken(app, user);
    await setRefreshCookie(reply, payload);
    return reply.send({ accessToken, user });
  });

  // Called on page load to restore an in-memory session from the refresh cookie.
  app.get('/me', async (request, reply) => {
    const token = request.cookies[REFRESH_COOKIE_NAME];
    if (!token) throw AppError.unauthorized();

    let refreshPayload: TokenPayload;
    try {
      refreshPayload = await refreshTokens.verify(token);
    } catch {
      reply.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
      throw AppError.unauthorized();
    }

    const user = await authService.getUserById(refreshPayload.sub);
    const { accessToken, payload } = buildAccessToken(app, user);
    await setRefreshCookie(reply, payload);
    return reply.send({ accessToken, user });
  });

  // Requires a valid access token — prevents CSRF-driven logouts.
  app.post('/logout', { preHandler: [app.authenticate] }, async (_request, reply) => {
    reply.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
    return reply.send({ success: true });
  });
};

export default authRoutes;
