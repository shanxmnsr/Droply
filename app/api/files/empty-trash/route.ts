import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET -> list all files in trash
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", files: [] }, { status: 401 });
    }

    const trashedFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)));

    return NextResponse.json(Array.isArray(trashedFiles) ? trashedFiles : []);
  } catch (error) {
    console.error("Error fetching trashed files:", error);
    return NextResponse.json({ error: "Failed to load trash", files: [] }, { status: 500 });
  }
}

// DELETE -> permanently delete all trashed files
export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Select all trashed files for logging
    const trashedFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)));

    if (!trashedFiles.length) {
      return NextResponse.json({ message: "Trash is already empty" });
    }

    // Delete all trashed files
    await db
      .delete(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)));

    return NextResponse.json({ message: `Emptied trash. Deleted ${trashedFiles.length} file(s).` });
  } catch (error) {
    console.error("Error emptying trash:", error);
    return NextResponse.json({ error: "Failed to empty trash" }, { status: 500 });
  }
}
