import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Pool: 10 connections per instance. Railway Postgres default limit ≈ 97.
// Max safe instances without pgBouncer: ~9. Add pgBouncer before scaling past 5.
//
// prepare: false is required for pgBouncer transaction-pooling mode.
// Without it, named prepared statements will fail with "prepared statement does not exist".
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
  connection: {
    // Hard limit on individual query duration — prevents runaway queries from starving the pool.
    statement_timeout: 30_000,
    // Release connections left open mid-transaction by crashed request handlers.
    idle_in_transaction_session_timeout: 10_000,
  },
});

export const db = drizzle(client, { schema });

export type Db = typeof db;
