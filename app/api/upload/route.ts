import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getServerIKClient } from "@/lib/imagekit"; 
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const fileData = formData.get("file");
    if (!(fileData instanceof File)) {
      return NextResponse.json({ error: "Invalid file uploaded" }, { status: 400 });
    }

    const parentId = formData.get("parentId") as string | null;

    // Convert to buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Initialize ImageKit (server-safe)
    const imagekit = getServerIKClient();

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: `${uuidv4()}_${fileData.name}`,
      folder: parentId || `/${userId}`,
    });

    // Save metadata in your database
    const dbRecord = {
      id: uuidv4(),
      name: fileData.name,
      path: uploadResponse.filePath || `/${userId}/${fileData.name}`,
      size: fileData.size,
      type: fileData.type,
      fileUrl: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || null,
      userId,
      parentId,
      isFolder: false,
      isStarred: false,
      isTrash: false,
    };

    const [newFile] = await db.insert(files).values(dbRecord).returning();

    // Return success response
    return NextResponse.json({
      message: "File uploaded successfully",
      url: uploadResponse.url,
      file: newFile,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file", details: (error as Error).message },
      { status: 500 }
    );
  }
}
