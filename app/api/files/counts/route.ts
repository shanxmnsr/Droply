import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({
      all: 0,
      starred: 0,
      trash: 0,
    });
  }

  const userCondition = eq(files.userId, userId);

  // ✅ ALL FILES (root level, non-trash)
  const all = await db
    .select()
    .from(files)
    .where(
      and(
        userCondition,
        eq(files.isTrash, false),
        isNull(files.parentId) // 🔴 THIS LINE
      )
    );

  // ⭐ STARRED (root level, non-trash)
  const starred = await db
    .select()
    .from(files)
    .where(
      and(
        userCondition,
        eq(files.isStarred, true),
        eq(files.isTrash, false),
        isNull(files.parentId) // 🔴 THIS LINE
      )
    );

  // 🗑 TRASH (GLOBAL – no parentId filter)
  const trash = await db
    .select()
    .from(files)
    .where(and(userCondition, eq(files.isTrash, true)));

  return NextResponse.json({
    all: all.length,
    starred: starred.length,
    trash: trash.length,
  });
}
