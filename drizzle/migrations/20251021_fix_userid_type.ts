export async function up(db: any) {
  // Change user_id column to TEXT so Clerk userIds work
  await db.execute(`
    ALTER TABLE files
    ALTER COLUMN user_id TYPE TEXT;
  `);
  console.log("Migration complete: files.user_id column changed to TEXT");
}

export async function down(db: any) {
  // Optional rollback
  await db.execute(`
    ALTER TABLE files
    ALTER COLUMN user_id TYPE UUID;
  `);
  console.log("Migration rollback: files.user_id column changed back to UUID");
}
