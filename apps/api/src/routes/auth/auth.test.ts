import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../services/auth.js', () => ({
  register: vi.fn(),
  verifyCredentials: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock('../../services/nonce.js', () => ({
  issueNonce: vi.fn().mockResolvedValue('test-nonce-uuid'),
  verifyNonce: vi.fn().mockResolvedValue(true),
  revokeNonce: vi.fn().mockResolvedValue(undefined),
}));

import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { AppError } from '../../lib/errors.js';
import authPlugin from '../../plugins/auth.js';
import errorHandler from '../../plugins/error-handler.js';
import * as authService from '../../services/auth.js';
import authRoutes from './index.js';

async function buildApp() {
  const app = Fastify({ logger: false });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(errorHandler);
  await app.register(authPlugin);
  await app.register(authRoutes, { prefix: '/auth' });
  await app.ready();
  return app;
}

const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@example.com',
  displayName: 'Test User',
  createdAt: new Date().toISOString(),
};

describe('POST /auth/register', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp();
  });

  beforeEach(() => vi.clearAllMocks());

  it('returns 201 with accessToken on success', async () => {
    vi.mocked(authService.register).mockResolvedValue(MOCK_USER as never);

    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'test@example.com',
        password: 'Password1!',
        displayName: 'Test User',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toHaveProperty('accessToken');
    expect(typeof body.accessToken).toBe('string');
  });

  it('returns 409 when email is already taken', async () => {
    vi.mocked(authService.register).mockRejectedValue(
      AppError.conflict('An account with this email already exists', 'EMAIL_TAKEN'),
    );

    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'taken@example.com',
        password: 'Password1!',
        displayName: 'Taken User',
      },
    });

    expect(res.statusCode).toBe(409);
  });

  it('returns 400 for invalid payload', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'not-an-email' },
    });

    expect(res.statusCode).toBe(400);
  });
});

describe('POST /auth/login', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp();
  });

  beforeEach(() => vi.clearAllMocks());

  it('returns 200 with accessToken on valid credentials', async () => {
    vi.mocked(authService.verifyCredentials).mockResolvedValue({
      id: MOCK_USER.id,
      email: MOCK_USER.email,
      displayName: MOCK_USER.displayName,
    });

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'test@example.com', password: 'Password1!' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('accessToken');
  });

  it('returns 401 for invalid credentials', async () => {
    vi.mocked(authService.verifyCredentials).mockRejectedValue(
      AppError.unauthorized('Invalid email or password'),
    );

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'bad@example.com', password: 'wrong' },
    });

    expect(res.statusCode).toBe(401);
  });
});

describe('POST /auth/logout', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp();
  });

  it('returns 401 without an access token', async () => {
    const res = await app.inject({ method: 'POST', url: '/auth/logout' });
    expect(res.statusCode).toBe(401);
  });

  it('returns 204 with a valid access token', async () => {
    const token = app.jwt.sign({
      sub: '00000000-0000-0000-0000-000000000001',
      email: 'test@example.com',
      displayName: 'Test',
    });
    const res = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(204);
  });
});
