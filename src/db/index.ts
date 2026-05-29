import * as schema from "./schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

// Conditional import based on environment
// For Next.js edge runtime (production/development): use @neondatabase/serverless
// For Node.js scripts (migrations, seeds): use node-postgres

let db: NodePgDatabase<typeof schema> | NeonHttpDatabase<typeof schema>;

if (typeof window === 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
  // Node.js environment (scripts, migrations)
  const { drizzle } = require("drizzle-orm/node-postgres");
  const { Pool } = require("pg");
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });
  
  db = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
} else {
  // Edge/Next.js environment
  const { neon } = require("@neondatabase/serverless");
  const { drizzle } = require("drizzle-orm/neon-http");
  
  const sql = neon(process.env.DATABASE_URL!);
  db = drizzle(sql, { schema }) as NeonHttpDatabase<typeof schema>;
}

export { db };
