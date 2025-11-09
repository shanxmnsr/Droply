import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import type { File } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", files: [] }, { status: 401 });
    }

    const parentId = request.nextUrl.searchParams.get("parentId") ?? null;

    let userFiles: File[] = [];
    try {
      if (parentId) {
        userFiles = await db
          .select()
          .from(files)
          .where(and(eq(files.userId, userId), eq(files.parentId, parentId)));
      } else {
        userFiles = await db
          .select()
          .from(files)
          .where(and(eq(files.userId, userId), isNull(files.parentId)));
      }
    } catch (dbError) {
      console.error("Database query failed:", dbError);
      return NextResponse.json({ error: "Database query failed", files: [] }, { status: 500 });
    }

    return NextResponse.json({ files: userFiles });
  } catch (error: unknown) {
    console.error("Error in /api/files:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error", files: [] },
      { status: 500 }
    );
  }
}
