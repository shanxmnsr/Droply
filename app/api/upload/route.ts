import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import imagekit from "@/lib/imagekit-client";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const fileData = formData.get("file");
    if (!(fileData instanceof File)) {
      return NextResponse.json({ error: "Invalid file uploaded" }, { status: 400 });
    }

    const parentId = formData.get("parentId") as string | null;

    // Convert to Base64 instead of Buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const base64File = Buffer.from(arrayBuffer).toString("base64");

    const uploadResponse = await imagekit.upload({
      file: base64File, // this fixes the 400
      fileName: `${uuidv4()}_${fileData.name}`,
      folder: parentId || `/${userId}`,
    });

    console.log("ImageKit upload response:", uploadResponse);

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

    return NextResponse.json({
      message: "File uploaded successfully",
      url: uploadResponse.url,
      file: newFile,
    });
  } catch (error) {
    console.error("Upload error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    return NextResponse.json(
      { error: "Failed to upload file", details: (error as Error).message },
      { status: 500 }
    );
  }
}
