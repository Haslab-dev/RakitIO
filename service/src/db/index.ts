import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

export function createDb(url: string, authToken: string) {
  const client = createClient({ url, authToken });
  return drizzle(client, { schema });
}

export function createDbFromBinding(binding: unknown) {
  const client = createClient(binding as any);
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;
export { schema };
