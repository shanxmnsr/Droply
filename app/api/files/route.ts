import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull, ilike, desc, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", files: [], totalPages: 1 },
        { status: 401 },
      );
    }

    // QUERY PARAMS
    const parentIdParam = request.nextUrl.searchParams.get("parentId");
    const search = request.nextUrl.searchParams.get("search") ?? "";
    const tab = request.nextUrl.searchParams.get("tab") ?? "all";

    const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);
    const offset = (page - 1) * limit;

    const parentId =
      parentIdParam && parentIdParam !== "null" ? parentIdParam : null;

    // FILTERS
    const conditions = [eq(files.userId, userId)];

    if (tab !== "trash") {
      if (parentId) {
        conditions.push(eq(files.parentId, parentId));
      } else {
        conditions.push(isNull(files.parentId));
      }
    }

    // SEARCH FILTER
    if (search.trim() !== "") {
      conditions.push(ilike(files.name, `%${search}%`));
    }

    // TAB FILTERS
    if (tab === "starred") {
      conditions.push(eq(files.isStarred, true), eq(files.isTrash, false));
    } else if (tab === "trash") {
      conditions.push(eq(files.isTrash, true));
    } else {
      conditions.push(eq(files.isTrash, false));
    }

    // TOTAL COUNT
    const totalCountResult = await db
      .select({ count: count() })
      .from(files)
      .where(and(...conditions));

    const totalCount = totalCountResult[0]?.count ?? 0;

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    const orderByClause =
      tab === "starred"
        ? desc(files.updatedAt)
        : tab === "trash"
          ? desc(files.updatedAt)
          : desc(files.createdAt);

    const paginatedFiles = await db
      .select()
      .from(files)
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      files: paginatedFiles,
      totalPages,
      currentPage: page,
      limit,
    });
  } catch (err) {
    console.error("Error fetching files:", err);

    return NextResponse.json(
      {
        error: "Unknown error",
        files: [],
        totalPages: 1,
      },
      { status: 500 },
    );
  }
}
