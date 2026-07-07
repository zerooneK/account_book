import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@/db/schema';
import { DbType } from '@/db';

export const createTestDb = () => {
  const client = createClient({
    url: 'file:test.db',
  });
  return drizzle(client, { schema });
};

export const clearDb = async (db: DbType) => {
  const tables = ['transactions', 'categories', 'accounts', 'users'];
  for (const table of tables) {
    try {
      await db.run(sql.raw(`DELETE FROM ${table}`));
    } catch {
      // Ignore if table does not exist yet
    }
  }
};
