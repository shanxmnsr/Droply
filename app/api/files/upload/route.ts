import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";
import imagekit from "@/lib/imagekit-client";

// Uploaded file including path info
interface FileWithPath extends Blob {
  name?: string;
  webkitRelativePath?: string;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const parentIdData = formData.get("parentId");

    const filesData = formData.getAll("files[]");
    if (!filesData || filesData.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Stores created folder IDs to avoid duplicate insertions
    const folderMap = new Map<string, string>();

    // Helper: create folder in DB and return its ID
    async function ensureFolder(fullPath: string) {
      if (folderMap.has(fullPath)) {
        return folderMap.get(fullPath)!;
      }

      const parts = fullPath.split("/").filter(Boolean);

      let parentId = typeof parentIdData === "string" ? parentIdData : null;
      let currentPath = "";

      for (const part of parts) {
        currentPath += currentPath ? `/${part}` : part;

        if (folderMap.has(currentPath)) {
          parentId = folderMap.get(currentPath)!;
          continue;
        }

        const folderId = uuidv4();

        await db.insert(files).values({
          id: folderId,
          name: part,
          path: "",
          size: 0,
          type: "folder",
          fileUrl: "",
          thumbnailUrl: null,
          userId,
          parentId,
          isFolder: true,
          isStarred: false,
          isTrash: false,
        });

        folderMap.set(currentPath, folderId);
        parentId = folderId;
      }

      return folderMap.get(fullPath)!;
    }

    const uploadedFiles = [];

    for (const entry of filesData) {
      if (!(entry instanceof Blob)) continue;

      const file = entry as FileWithPath;

      const relativePath = file.webkitRelativePath || file.name!;
      const pathParts = relativePath.split("/");

      // Extract folder path (excluding last item which is file name)
      const folderPath = pathParts.slice(0, -1).join("/");

      // Create needed folders in DB
      let parentId = null;
      if (folderPath) {
        parentId = await ensureFolder(folderPath);
      } else {
        parentId = typeof parentIdData === "string" ? parentIdData : null;
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isVideo && !isImage) continue;

      if ((isImage && buffer.length > 5 * 1024 * 1024) ||
          (isVideo && buffer.length > 100 * 1024 * 1024)) {
        continue;
      }

      const fileName = `${uuidv4()}_${file.name}`;
      const base64File = buffer.toString("base64");

      const folder = isVideo ? `/videos/user_${userId}` : `/user_${userId}`;

      const uploadResponse = await imagekit.upload({
        file: base64File,
        fileName,
        folder,
      });

      const fileId = uuidv4();

      await db.insert(files).values({
        id: fileId,
        name: file.name!,
        path: uploadResponse.filePath ?? "",
        size: buffer.length,
        type: file.type ?? "application/octet-stream",
        fileUrl: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl ?? null,
        userId,
        parentId,
        isFolder: false,
        isStarred: false,
        isTrash: false,
      });

      uploadedFiles.push({
        name: file.name,
        url: uploadResponse.url,
      });
    }

    return NextResponse.json({ success: true, uploadedFiles }, { status: 200 });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
