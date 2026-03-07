import { describe, expect, it } from 'vitest';
import { refreshTokens } from './refreshToken.js';

describe('refreshTokens', () => {
  const payload = {
    sub: '00000000-0000-0000-0000-000000000001',
    email: 'test@example.com',
    displayName: 'Test User',
    nonce: 'abc-123',
  };

  it('signs and verifies a valid token', async () => {
    const token = await refreshTokens.sign(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const verified = await refreshTokens.verify(token);
    expect(verified.sub).toBe(payload.sub);
    expect(verified.email).toBe(payload.email);
    expect(verified.displayName).toBe(payload.displayName);
    expect(verified.nonce).toBe(payload.nonce);
  });

  it('throws on a tampered token', async () => {
    const token = await refreshTokens.sign(payload);
    const tampered = `${token.slice(0, -5)}XXXXX`;
    await expect(refreshTokens.verify(tampered)).rejects.toThrow();
  });

  it('throws on an empty string', async () => {
    await expect(refreshTokens.verify('')).rejects.toThrow();
  });

  it('throws on a token signed with a different secret', async () => {
    const { SignJWT } = await import('jose');
    const wrongSecret = new TextEncoder().encode('completely-different-secret-32ch!!');
    const wrongToken = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(wrongSecret);

    await expect(refreshTokens.verify(wrongToken)).rejects.toThrow();
  });
});
