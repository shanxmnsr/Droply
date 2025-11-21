import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { name, parentId = null } = await req.json();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    // Insert folder into `files` table
    await db.insert(files).values({
      id: uuidv4(),
      name,
      parentId,
      userId,
      isFolder: true,
      isStarred: false,
      isTrash: false,
      path: "",
      size: 0,
      type: "folder",
      fileUrl: "",
      thumbnailUrl: null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Folder creation failed:", error);
    return NextResponse.json({ error: "Folder creation failed" }, { status: 500 });
  }
}
