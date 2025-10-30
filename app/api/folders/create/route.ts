import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, parentId } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    const id = uuidv4();

    await db.insert(files).values({
      id,
      name: name.trim(),
      path: "/",   
      size: 0,          
      type: "folder",   
      fileUrl: "",      
      thumbnail: null,
      userId,
      parentId: parentId || null,
      isFolder: true,
      isStarred: false,
      isTrash: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Folder creation error:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
