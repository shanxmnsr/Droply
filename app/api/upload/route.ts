import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import imagekit from "@/lib/imagekit-client";
import { v4 as uuidv4 } from "uuid";

// Type for ImageKit upload response
interface ImageKitUploadResponse {
  filePath: string;
  url: string;
  thumbnailUrl?: string | null;
}

// Minimal type for a file row
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
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data safely
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err) {
      console.error("Failed to parse form data:", err);
      return NextResponse.json(
        { error: "Failed to parse uploaded files. File may be too large." },
        { status: 400 }
      );
    }

    // Get files from form data and ensure type is File
    const allFiles: File[] = formData.getAll("files").filter(
      (f): f is File => f instanceof File
    );
    if (!allFiles.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const rootParentId = (formData.get("parentId") as string) || null;
    const uploadedFiles: FileRow[] = [];
    const folderMap: Record<string, string> = {}; 

    console.log("Starting upload for user:", userId);
    console.log("Received files:", allFiles.map((f) => f.name));

    for (const fileData of allFiles) {
      // Handle folder structure
      const relativePath = (fileData as any).webkitRelativePath || fileData.name;
      const parts = relativePath.split("/");
      const fileName = parts.pop()!;
      let currentParentId = rootParentId;
      let currentPath = "";

      // Create folders if they don’t exist
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

      // Upload file to ImageKit
      let uploadResponse: ImageKitUploadResponse;
      try {
        const arrayBuffer = await fileData.arrayBuffer();
        const base64File = `data:${fileData.type};base64,${Buffer.from(arrayBuffer).toString(
          "base64"
        )}`;

        uploadResponse = (await imagekit.upload({
          file: base64File,
          fileName: `${uuidv4()}_${fileName}`,
          folder: `/${userId}`,
        })) as ImageKitUploadResponse;
      } catch (err) {
        console.error("ImageKit upload error:", err);
        return NextResponse.json(
          { error: "ImageKit upload failed", details: String(err) },
          { status: 500 }
        );
      }

      // Save file record to DB
      try {
        const fileId = uuidv4();
        const [newFile] = await db
          .insert(files)
          .values({
            id: fileId,
            name: fileName,
            path: uploadResponse.filePath,
            size: fileData.size,
            type: fileData.type,
            fileUrl: uploadResponse.url,
            thumbnailUrl: uploadResponse.thumbnailUrl || null,
            userId,
            parentId: currentParentId,
            isFolder: false,
            isStarred: false,
            isTrash: false,
          })
          .returning();

        uploadedFiles.push(newFile as FileRow);
      } catch (err) {
        console.error("DB insert error:", err);
        return NextResponse.json(
          { error: "Database insert failed", details: String(err) },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: "Folder + Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: String(error) },
      { status: 500 }
    );
  }
}
