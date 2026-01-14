import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

config({ path: '../../.env' });
const client = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
});

const db = drizzle({ client: client, schema });

export default db;
