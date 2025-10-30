import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Load environment variables
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in environment");
}

// Initialize Neon connection via HTTP (required for serverless/remote Neon)
const sql = neon(process.env.DATABASE_URL!);

// Initialize Drizzle ORM with schema
export const db = drizzle(sql, { schema });

export { sql };
