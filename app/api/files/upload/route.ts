import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";
import imagekit from "@/lib/imagekit-client";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fileData = formData.get("file");
    const parentIdData = formData.get("parentId");

    if (!fileData || !(fileData instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Convert Blob to Buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `${uuidv4()}-${(fileData as any).name || "file"}`;
    const base64File = buffer.toString("base64");

    const uploadResponse = await imagekit.upload({
      file: base64File,
      fileName,
      folder: `/user_${userId}`,
    });

    await db.insert(files).values({
      id: uuidv4(),
      name: fileName,
      path: uploadResponse.filePath ?? "",
      size: buffer.length,
      type: (fileData as any).type ?? "application/octet-stream",
      fileUrl: uploadResponse.url,
      thumbnail: uploadResponse.thumbnailUrl ?? "",
      userId,
      parentId: typeof parentIdData === "string" ? parentIdData : null,
      isFolder: false,
      isStarred: false,
      isTrash: false,
    });

    return NextResponse.json({ success: true, fileUrl: uploadResponse.url }, { status: 200 });
  } catch (error) {
    console.error("Upload failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
