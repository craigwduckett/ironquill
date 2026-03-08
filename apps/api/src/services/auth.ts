import type { LoginInput, RegisterInput } from '@ironquill/shared';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users } from '../db/schema/users.js';
import { AppError } from '../lib/errors.js';

const SALT_ROUNDS = 12;

export async function register(input: RegisterInput) {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (existing) {
    throw AppError.conflict('An account with this email already exists', 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const [user] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      passwordHash,
      displayName: input.displayName,
    })
    .returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      createdAt: users.createdAt,
    });

  if (!user) throw new Error('Insert failed to return user row');
  return user;
}

export async function verifyCredentials(input: LoginInput) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  return { id: user.id, email: user.email, displayName: user.displayName };
}

export async function getUserById(id: string) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) throw AppError.unauthorized();
  return user;
}
