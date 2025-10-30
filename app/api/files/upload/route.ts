
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";
import { imagekit } from "@/lib/imagekit";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const parentId = formData.get("parentId") as string | null;
    const { userId } = await auth();

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing file or unauthenticated user" },
        { status: 400 }
      );
    }

    // Convert file to base64 for ImageKit upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64File = buffer.toString("base64");

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: base64File,
      fileName: `${uuidv4()}-${file.name}`,
      folder: `/user_${userId}`,
    });

    // Insert into DB
    await db.insert(files).values({
      id: uuidv4(),
      name: file.name,
      path: uploadResponse.filePath || "",
      size: file.size,
      type: file.type,
      fileUrl: uploadResponse.url,
      thumbnail: uploadResponse.thumbnailUrl || "",
      userId,
      parentId: parentId || null,
      isFolder: false,
      isStarred: false,
      isTrash: false,
    });

    return NextResponse.json(
      { success: true, fileUrl: uploadResponse.url },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "File upload failed", details: error.message },
      { status: 500 }
    );
  }
}
