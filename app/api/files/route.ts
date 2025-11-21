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

    // --- Safe parentId parsing ---
    const parentIdParam = request.nextUrl.searchParams.get("parentId");
    const parentId =
      parentIdParam &&
      parentIdParam !== "null" &&
      parentIdParam !== "undefined" &&
      parentIdParam.trim() !== ""
        ? parentIdParam
        : null;

    console.log("Fetching files for user:", userId, "parentId:", parentId);

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
      // Log detailed error for debugging
      console.error("Database query failed:", dbError, { userId, parentId });

      // Return safe response to frontend (no 500)
      return NextResponse.json({
        error: "Database query failed (check server logs)",
        files: [],
      });
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
