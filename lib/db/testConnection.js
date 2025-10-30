import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in environment");
}

const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    const result = await sql.query("SELECT NOW() as now");
    console.log("Current database time:", result[0].now);
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();
