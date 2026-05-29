import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
const envPath = resolve(".env.local");
config({ path: envPath });

// Log for debugging
console.log(`Loading env from: ${envPath}`);
console.log(`DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // For local development with drizzle-kit
  verbose: true,
  strict: true,
});
