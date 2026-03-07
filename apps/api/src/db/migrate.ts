import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Migrations must run on a single, non-pooled connection — not the app pool.
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

const migrationsFolder = resolve(fileURLToPath(new URL('.', import.meta.url)), 'migrations');

try {
  await migrate(db, { migrationsFolder });
  console.log('Migrations applied successfully');
} finally {
  await client.end();
}
