import { migrate } from "drizzle-orm/neon-http/migrator";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as dotenv from "dotenv"

dotenv.config({path: ".env.local"});

if(!process.env.DATABASE_URL) {
    throw new Error("Database url is not set in .env.local");
}

async function runMigration() {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        // initialisation the connection, we do it through the dizzle 
        // db initialise connection
        const db = drizzle(sql);

        // this proces take time that's why we're gonna "await" this 
        // all the sql related files in drizzle folder
        await migrate(db, {migrationsFolder: "./drizzle"})  // db-> connection string ... {migrateFolder} -> where's the migration needs to go, where i want to keep it(the folder)
        console.log("All migrations are successfully done");

    }catch {
        console.log("All migrations are successfully done");
        process.exit(1);
    }
}

runMigration();