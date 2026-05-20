// existed code 
// import { db } from "@/lib/db";
// import { files } from "@/lib/db/schema";
// import { auth } from "@clerk/nextjs/server";
// import { eq, and, isNull, ilike } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return NextResponse.json(
//         { error: "Unauthorized", files: [], totalPages: 1 },
//         { status: 401 },
//       );
//     }

//     // query params
//     const parentIdParam = request.nextUrl.searchParams.get("parentId");
//     const search = request.nextUrl.searchParams.get("search") ?? "";
//     const tab = request.nextUrl.searchParams.get("tab") ?? "all";
//     const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
//     const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);
//     const offset = (page - 1) * limit;

//     const parentId =
//       parentIdParam && parentIdParam !== "null" ? parentIdParam : null;

//     // build filter conditions
//     const conditions: any[] = [eq(files.userId, userId)];

//     // existed code
//     // if (parentId) conditions.push(eq(files.parentId, parentId));
//     // else conditions.push(isNull(files.parentId));

//     // updated code
//     // parentId filter should NOT apply to trash
//     if (tab !== "trash") {
//       if (parentId) conditions.push(eq(files.parentId, parentId));
//       else conditions.push(isNull(files.parentId));
//     }

//     if (search.trim() !== "") conditions.push(ilike(files.name, `%${search}%`));

//     // apply tab filters before pagination
//     if (tab === "starred") {
//       conditions.push(eq(files.isStarred, true), eq(files.isTrash, false));
//     } else if (tab === "trash") {
//       conditions.push(eq(files.isTrash, true));
//     } else if (tab === "all") {
//       conditions.push(eq(files.isTrash, false));
//     }

//     // get total count for pagination
//     const allMatchingFiles = await db
//       .select()
//       .from(files)
//       .where(and(...conditions));
//     const totalCount = allMatchingFiles.length;
//     const totalPages = Math.ceil(totalCount / limit);

//     // fetch only files for the current page
//     const paginatedFiles = await db
//       .select()
//       .from(files)
//       .where(and(...conditions))
//       .limit(limit)
//       .offset(offset);

//     return NextResponse.json({ files: paginatedFiles, totalPages });
//   } catch (err) {
//     console.error("Error fetching files:", err);
//     return NextResponse.json(
//       { error: "Unknown error", files: [], totalPages: 1 },
//       { status: 500 },
//     );
//   }
// }







// ----------------------------------------------------------------------------------







// // this is for global count
// import { db } from "@/lib/db";
// import { files } from "@/lib/db/schema";
// import { auth } from "@clerk/nextjs/server";
// import { eq, and, isNull, ilike, desc } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return NextResponse.json(
//         { error: "Unauthorized", files: [], totalPages: 1 },
//         { status: 401 },
//       );
//     }

//     // query params
//     const parentIdParam = request.nextUrl.searchParams.get("parentId");
//     const search = request.nextUrl.searchParams.get("search") ?? "";
//     const tab = request.nextUrl.searchParams.get("tab") ?? "all";
//     const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
//     const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);
//     const offset = (page - 1) * limit;

//     const parentId =
//       parentIdParam && parentIdParam !== "null" ? parentIdParam : null;

//     // build filter conditions
//     const conditions = [eq(files.userId, userId)];

//     // parentId filter should NOT apply to trash
//     if (tab !== "trash") {
//       if (parentId) conditions.push(eq(files.parentId, parentId));
//       else conditions.push(isNull(files.parentId));
//     }

//     if (search.trim() !== "") conditions.push(ilike(files.name, `%${search}%`));

//     // apply tab filters before pagination
//     if (tab === "starred") {
//       conditions.push(eq(files.isStarred, true), eq(files.isTrash, false));
//     } else if (tab === "trash") {
//       conditions.push(eq(files.isTrash, true));
//     } else if (tab === "all") {
//       conditions.push(eq(files.isTrash, false));
//     }

//     // get total count for pagination
//     const allMatchingFiles = await db
//       .select()
//       .from(files)
//       .where(and(...conditions));
//     const totalCount = allMatchingFiles.length;
//     const totalPages = Math.ceil(totalCount / limit);

//     // fetch only files for the current page
//     const paginatedFiles = await db
//       .select()
//       .from(files)
//       .where(and(...conditions))
//       .orderBy(desc(files.createdAt))

//       .limit(limit)
//       .offset(offset);

//     return NextResponse.json({ files: paginatedFiles, totalPages });
//   } catch (err) {
//     console.error("Error fetching files:", err);
//     return NextResponse.json(
//       { error: "Unknown error", files: [], totalPages: 1 },
//       { status: 500 },
//     );
//   }
// }



// FOR PRODUCTION LEVEL
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
        { status: 401 }
      );
    }

    // ---------------- query params ----------------
    const parentIdParam = request.nextUrl.searchParams.get("parentId");
    const search = request.nextUrl.searchParams.get("search") ?? "";
    const tab = request.nextUrl.searchParams.get("tab") ?? "all";

    const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);
    const offset = (page - 1) * limit;

    const parentId =
      parentIdParam && parentIdParam !== "null" ? parentIdParam : null;

    // ---------------- filters ----------------
    const conditions = [eq(files.userId, userId)];

    // parentId filter should NOT apply to trash
    if (tab !== "trash") {
      if (parentId) {
        conditions.push(eq(files.parentId, parentId));
      } else {
        conditions.push(isNull(files.parentId));
      }
    }

    if (search.trim() !== "") {
      conditions.push(ilike(files.name, `%${search}%`));
    }

    if (tab === "starred") {
      conditions.push(eq(files.isStarred, true), eq(files.isTrash, false));
    } else if (tab === "trash") {
      conditions.push(eq(files.isTrash, true));
    } else if (tab === "all") {
      conditions.push(eq(files.isTrash, false));
    }

    // ---------------- TOTAL COUNT (FIXED) ----------------
    const totalCountResult = await db
      .select({ count: count() })
      .from(files)
      .where(and(...conditions));

    const totalCount = totalCountResult[0]?.count ?? 0;
    const totalPages = Math.ceil(totalCount / limit);

    // ---------------- PAGINATED DATA ----------------
    const paginatedFiles = await db
      .select()
      .from(files)
      .where(and(...conditions))
      .orderBy(desc(files.createdAt))
      .limit(limit)
      .offset(offset);

    // ---------------- RESPONSE ----------------
    return NextResponse.json({
      files: paginatedFiles,
      totalPages,
      currentPage: page,
      limit,
    });
  } catch (err) {
    console.error("Error fetching files:", err);

    return NextResponse.json(
      { error: "Unknown error", files: [], totalPages: 1 },
      { status: 500 }
    );
  }
}






// --------------------------------------------------------------------------------










// // this code is for per page counting 

// import { db } from "@/lib/db";
// import { files } from "@/lib/db/schema";
// import { auth } from "@clerk/nextjs/server";
// import { eq, and, isNull, ilike } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return NextResponse.json(
//         { error: "Unauthorized", files: [], totalPages: 1 },
//         { status: 401 }
//       );
//     }

//     // query params
//     const parentIdParam = request.nextUrl.searchParams.get("parentId");
//     const search = request.nextUrl.searchParams.get("search") ?? "";
//     const tab = request.nextUrl.searchParams.get("tab") ?? "all";
//     const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
//     const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);
//     const offset = (page - 1) * limit;

//     const parentId =
//       parentIdParam && parentIdParam !== "null" ? parentIdParam : null;

//     // build filter conditions
//     const conditions: any[] = [eq(files.userId, userId)];

//     // parentId filter should NOT apply to trash
//     if (tab !== "trash") {
//       if (parentId) conditions.push(eq(files.parentId, parentId));
//       else conditions.push(isNull(files.parentId));
//     }

//     if (search.trim() !== "") {
//       conditions.push(ilike(files.name, `%${search}%`));
//     }

//     // tab filters
//     if (tab === "starred") {
//       conditions.push(eq(files.isStarred, true), eq(files.isTrash, false));
//     } else if (tab === "trash") {
//       conditions.push(eq(files.isTrash, true));
//     } else if (tab === "all") {
//       conditions.push(eq(files.isTrash, false));
//     }

//     // get total matching count for pagination
//     const allMatchingFiles = await db
//       .select()
//       .from(files)
//       .where(and(...conditions));
//     const totalCount = allMatchingFiles.length;
//     const totalPages = Math.ceil(totalCount / limit);

//     // fetch only files for the current page
//     const paginatedFiles = await db
//       .select()
//       .from(files)
//       .where(and(...conditions))
//       .limit(limit)
//       .offset(offset);

//     return NextResponse.json({ files: paginatedFiles, totalPages });
//   } catch (err) {
//     console.error("Error fetching files:", err);
//     return NextResponse.json(
//       { error: "Unknown error", files: [], totalPages: 1 },
//       { status: 500 }
//     );
//   }
// }
