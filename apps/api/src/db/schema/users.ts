import { index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    displayName: varchar('display_name', { length: 50 }).notNull(),
    discordId: varchar('discord_id', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Index for OAuth discord_id lookups. Partial WHERE is applied in the migration SQL.
    index('users_discord_id_idx').on(t.discordId),
  ],
);

// One active nonce per user — rotated on every refresh/me call, deleted on logout.
// Enables server-side refresh token revocation without a full token store.
export const refreshTokenNonces = pgTable('refresh_token_nonces', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  nonce: uuid('nonce').notNull().defaultRandom(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RefreshTokenNonce = typeof refreshTokenNonces.$inferSelect;
