import rateLimit from '@fastify/rate-limit';
import { LoginSchema, RegisterSchema } from '@ironquill/shared';
import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { AppError } from '../../lib/errors.js';
import { refreshTokens } from '../../lib/refreshToken.js';
import * as authService from '../../services/auth.js';
import * as nonceService from '../../services/nonce.js';

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_COOKIE_NAME = 'refreshToken';
// Scoped to /auth so the cookie is sent to /auth/me (session restore),
// /auth/refresh (silent renewal) and /auth/logout — but NOT to other routes.
const REFRESH_COOKIE_PATH = '/auth';

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
  const nonce = await nonceService.issueNonce(payload.sub);
  const refreshToken = await refreshTokens.sign({ ...payload, nonce });
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

    // #region agent log
    const fsLogin = await import('node:fs');
    fsLogin.appendFileSync(
      '/home/craig/git/ironquill/.cursor/debug-6e1f58.log',
      JSON.stringify({
        sessionId: '6e1f58',
        location: 'auth/index.ts:/login',
        message: 'POST /login success',
        data: {
          cookiePath: REFRESH_COOKIE_PATH,
          cookieName: REFRESH_COOKIE_NAME,
          setCookieHeader: reply.getHeader('set-cookie'),
          requestOrigin: request.headers.origin,
          requestHost: request.headers.host,
        },
        timestamp: Date.now(),
      }) + '\n',
    );
    // #endregion

    return reply.send({ accessToken, user });
  });

  // Consumes the httpOnly refresh cookie and issues a new access token.
  // Verifies the nonce in the token against the DB row — invalidated on logout.
  // Rotates both the refresh cookie and the DB nonce on every successful call.
  app.post('/refresh', async (request, reply) => {
    const token = request.cookies[REFRESH_COOKIE_NAME];
    if (!token) throw AppError.unauthorized('No refresh token');

    let refreshPayload: TokenPayload & { nonce: string };
    try {
      refreshPayload = await refreshTokens.verify(token);
    } catch {
      reply.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    const nonceValid = await nonceService.verifyNonce(refreshPayload.sub, refreshPayload.nonce);
    if (!nonceValid) {
      reply.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
      throw AppError.unauthorized('Refresh token has been revoked');
    }

    const user = await authService.getUserById(refreshPayload.sub);
    const { accessToken, payload } = buildAccessToken(app, user);
    await setRefreshCookie(reply, payload);
    return reply.send({ accessToken, user });
  });

  // Called on page load to restore an in-memory session from the refresh cookie.
  app.get('/me', async (request, reply) => {
    const token = request.cookies[REFRESH_COOKIE_NAME];

    // #region agent log
    const fs = await import('node:fs');
    fs.appendFileSync(
      '/home/craig/git/ironquill/.cursor/debug-6e1f58.log',
      JSON.stringify({
        sessionId: '6e1f58',
        location: 'auth/index.ts:/me',
        message: 'GET /me received',
        data: {
          hasCookie: !!token,
          allCookieKeys: Object.keys(request.cookies),
          cookiePath: REFRESH_COOKIE_PATH,
          headers: {
            cookie: request.headers.cookie?.slice(0, 80) ?? null,
            host: request.headers.host,
            origin: request.headers.origin,
          },
        },
        timestamp: Date.now(),
      }) + '\n',
    );
    // #endregion

    if (!token) throw AppError.unauthorized();

    let refreshPayload: TokenPayload & { nonce: string };
    try {
      refreshPayload = await refreshTokens.verify(token);
    } catch {
      reply.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
      throw AppError.unauthorized();
    }

    const nonceValid = await nonceService.verifyNonce(refreshPayload.sub, refreshPayload.nonce);
    if (!nonceValid) {
      reply.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
      throw AppError.unauthorized();
    }

    const user = await authService.getUserById(refreshPayload.sub);
    const { accessToken, payload } = buildAccessToken(app, user);
    await setRefreshCookie(reply, payload);
    return reply.send({ accessToken, user });
  });

  // Requires a valid access token — prevents CSRF-driven logouts.
  // Revokes the nonce so the refresh cookie is immediately invalid.
  app.post('/logout', { preHandler: [app.authenticate] }, async (request, reply) => {
    await nonceService.revokeNonce(request.user.sub);
    reply.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
    return reply.code(204).send();
  });
};

export default authRoutes;
