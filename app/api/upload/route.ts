import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import imagekit from "@/lib/imagekit-client";
import { v4 as uuidv4 } from "uuid";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  url: string;
  filePath: string;
  thumbnailUrl?: string;
}

type FileWithPath = File & {
  webkitRelativePath?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let formData: FormData;

    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const allFiles = formData
      .getAll("files")
      .filter((f): f is File => f instanceof File);

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const rootParentId = (formData.get("parentId") as string) || null;

    const uploadedFiles = [];
    const folderMap: Record<string, string> = {};

    for (const fileData of allFiles) {
      const isImage = fileData.type.startsWith("image/");
      const isVideo = fileData.type.startsWith("video/");

      // SIZE VALIDATION
      if (isImage && fileData.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `${fileData.name} exceeds 5MB limit` },
          { status: 400 },
        );
      }

      if (isVideo && fileData.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          { error: `${fileData.name} exceeds 100MB limit` },
          { status: 400 },
        );
      }

      const relativePath =
        (fileData as FileWithPath).webkitRelativePath || fileData.name;

      const parts = relativePath.split("/");
      const fileName = parts.pop()!;

      let currentParentId = rootParentId;
      let currentPath = "";

      // FOLDER CREATION
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

      // IMAGEKIT UPLOAD
      let uploadResponse: ImageKitUploadResponse;

      try {
        const buffer = Buffer.from(await fileData.arrayBuffer());

        const base64File = `data:${fileData.type};base64,${buffer.toString(
          "base64",
        )}`;

        uploadResponse = (await imagekit.upload({
          file: base64File,
          fileName: `${uuidv4()}_${fileName}`,
          folder: `/droply/files/${userId}`,
        })) as ImageKitUploadResponse;

        console.log("ImageKit upload success:", uploadResponse);
      } catch (err) {
        console.error(" ImageKit upload failed:", err);

        return NextResponse.json(
          {
            error: "File upload failed (check ImageKit config)",
          },
          { status: 500 },
        );
      }

      // SAFETY CHECK
      if (!uploadResponse?.url || !uploadResponse?.filePath) {
        return NextResponse.json(
          {
            error: "Invalid upload response from ImageKit",
          },
          { status: 500 },
        );
      }

      // DB SAVE
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

      uploadedFiles.push(savedFile);
    }

    return NextResponse.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
