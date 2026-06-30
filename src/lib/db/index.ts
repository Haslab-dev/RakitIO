import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

export type Database = ReturnType<typeof createDrizzleDb>;

// Turso/libSQL credentials are read from Vite env vars and bundled into the
// client. NOTE: this means the auth token is exposed to anyone who opens the
// app. This is an accepted tradeoff of the client-only architecture (see
// RFC-0001). Use a token with the minimum required permissions.
function getTursoConfig() {
  const url = import.meta.env.VITE_TURSO_URL as string | undefined;
  const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN as string | undefined;
  if (!url) {
    console.warn(
      '[db] VITE_TURSO_URL is not set. Database calls will fail. Copy .env.example to .env and configure your Turso credentials.',
    );
  }
  return { url: url ?? 'http://localhost:8080', authToken };
}

export function createDrizzleDb() {
  const config = getTursoConfig();
  const client = createClient(config);
  return drizzle(client, { schema });
}

// A single shared client for the app.
export const db = createDrizzleDb();
export { schema };
