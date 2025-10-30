
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",       // path to schema file
  out: "./drizzle/migrations",        // migrations output folder
  dialect: "postgresql",              // required
  dbCredentials: {
    url: process.env.DATABASE_URL!,   // modern syntax (no driver key needed)
  },
  verbose: true,
});
