import { jwtVerify, SignJWT } from 'jose';
import { env } from './env.js';

export type RefreshPayload = {
  sub: string;
  email: string;
  displayName: string;
};

const secret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

export const refreshTokens = {
  async sign(payload: RefreshPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);
  },

  async verify(token: string): Promise<RefreshPayload> {
    const { payload } = await jwtVerify(token, secret);

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.displayName !== 'string'
    ) {
      throw new Error('Invalid refresh token payload');
    }

    return {
      sub: payload.sub,
      email: payload.email as string,
      displayName: payload.displayName as string,
    };
  },
};
