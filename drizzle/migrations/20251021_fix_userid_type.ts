import { sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// define table schema again for reference
export const files = pgTable("files", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull(), // <-- fixed to text instead of integer
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Actual migration script
export async function up(db: any): Promise<void> {
  // Drop old column if it was integer and recreate as text
  await db.execute(sql`
    ALTER TABLE files
    ALTER COLUMN user_id TYPE text USING user_id::text;
  `);
}

export async function down(db: any): Promise<void> {
  // Rollback (convert back to integer if needed)
  await db.execute(sql`
    ALTER TABLE files
    ALTER COLUMN user_id TYPE integer USING user_id::integer;
  `);
}
