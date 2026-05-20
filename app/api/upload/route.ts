

import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import imagekit from "@/lib/imagekit-client";
import { v4 as uuidv4 } from "uuid";

// Limits
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// ImageKit response type
interface ImageKitUploadResponse {
  filePath: string;
  url: string;
  thumbnailUrl?: string | null;
}

// DB row type
interface FileRow {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  fileUrl: string;
  thumbnailUrl?: string | null;
  userId: string;
  parentId: string | null;
  isFolder: boolean;
  isStarred: boolean;
  isTrash: boolean;
}

export async function POST(req: NextRequest) {
  try {
    /* AUTH  */
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /*  PARSE FORM DATA  */
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Failed to parse form data. File may be too large." },
        { status: 400 }
      );
    }

    const allFiles: File[] = formData
      .getAll("files")
      .filter((f): f is File => f instanceof File);

    if (!allFiles.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const rootParentId =
      (formData.get("parentId") as string) || null;

    const uploadedFiles: FileRow[] = [];
    const folderMap: Record<string, string> = {};

    /* ------------ PROCESS FILES ------------ */
    for (const fileData of allFiles) {
      const isImage = fileData.type.startsWith("image/");
      const isVideo = fileData.type.startsWith("video/");

      /* -------- SIZE VALIDATION (IMPORTANT) -------- */
      if (isImage && fileData.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `Image "${fileData.name}" exceeds 5MB limit` },
          { status: 400 }
        );
      }

      if (isVideo && fileData.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          { error: `Video "${fileData.name}" exceeds 100MB limit` },
          { status: 400 }
        );
      }

      if (!isImage && !isVideo) {
        return NextResponse.json(
          { error: `Unsupported file type: ${fileData.name}` },
          { status: 400 }
        );
      }

      /* -------- HANDLE FOLDER STRUCTURE -------- */
      const relativePath =
        (fileData as { webkitRelativePath?: string }).webkitRelativePath ||
        fileData.name;

      const parts = relativePath.split("/");
      const fileName = parts.pop()!;
      let currentParentId = rootParentId;
      let currentPath = "";

      for (const folderName of parts) {
        currentPath += `/${folderName}`;

        if (!folderMap[currentPath]) {
          const folderId = uuidv4();

          await db.insert(files).values({
            id: folderId,
            name: folderName,
            path: "",
            size: 0,
            type: "folder",
            fileUrl: "",
            thumbnailUrl: null,
            userId,
            parentId: currentParentId,
            isFolder: true,
            isStarred: false,
            isTrash: false,
          });

          folderMap[currentPath] = folderId;
        }

        currentParentId = folderMap[currentPath];
      }

      /* -------- UPLOAD TO IMAGEKIT -------- */
      let uploadResponse: ImageKitUploadResponse;
      try {
        const arrayBuffer = await fileData.arrayBuffer();
        const base64File = `data:${fileData.type};base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;

        uploadResponse = (await imagekit.upload({
          file: base64File,
          fileName: `${uuidv4()}_${fileName}`,
          folder: `/${userId}`,
        })) as ImageKitUploadResponse;
      } catch (err) {
        console.error("ImageKit upload failed:", err);
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 }
        );
      }

      /* -------- SAVE TO DATABASE -------- */
      const fileId = uuidv4();

      const [savedFile] = await db
        .insert(files)
        .values({
          id: fileId,
          name: fileName,
          path: uploadResponse.filePath,
          size: fileData.size,
          type: fileData.type,
          fileUrl: uploadResponse.url,
          thumbnailUrl: uploadResponse.thumbnailUrl ?? null,
          userId,
          parentId: currentParentId,
          isFolder: false,
          isStarred: false,
          isTrash: false,
        })
        .returning();

      uploadedFiles.push(savedFile as FileRow);
    }

    /* ------------ SUCCESS RESPONSE ----------- */
    return NextResponse.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
