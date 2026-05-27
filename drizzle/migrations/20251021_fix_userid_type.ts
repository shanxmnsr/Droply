import { sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const files = pgTable("files", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export async function up(db: any): Promise<void> {
  await db.execute(sql`
    ALTER TABLE files
    ALTER COLUMN user_id TYPE text USING user_id::text;
  `);
}

export async function down(db: any): Promise<void> {
  await db.execute(sql`
    ALTER TABLE files
    ALTER COLUMN user_id TYPE integer USING user_id::integer;
  `);
}
