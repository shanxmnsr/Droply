"use client";

import { IKImage } from "imagekitio-react";
import type { File as FileType } from "@/lib/db/schema";
import { getIKPath } from "@/lib/imagekit";
import { Folder, FileText, Play } from "lucide-react";

interface FileIconProps {
  file: FileType;
}

export default function FileIcon({ file }: FileIconProps) {
  // Folder icon
  if (file.isFolder) {
    return <Folder className="h-5 w-5 text-blue-500" />;
  }

  const fileType = file.type?.split("/")[0];

  // IMAGE PREVIEW
  if (fileType === "image") {
    const normalizedPath = getIKPath(file.path);

    return (
      <div className="h-12 w-12 relative overflow-hidden rounded-xl bg-base-200 shadow-sm">
        {normalizedPath ? (
          <IKImage
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
            path={normalizedPath}
            transformation={[
              {
                height: 48,
                width: 48,
                focus: "auto",
                quality: 80,
                dpr: 2,
              },
            ]}
            loading="lazy"
            lqip={{ active: true }}
            alt={file.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-gray-400 text-xs flex items-center justify-center h-full">
            No preview
          </span>
        )}
      </div>
    );
  }

  // CLEAN VIDEO STYLE
  if (fileType === "video") {
    return (
      <div >
        <Play className="h-5 w-5 text-purple-600" />
      </div>
    );
  }

  // PDF
  if (file.type?.includes("pdf")) {
    return <FileText className="h-5 w-5 text-red-500" />;
  }

  // Other application files
  if (fileType === "application") {
    return <FileText className="h-5 w-5 text-orange-500" />;
  }

  // Default icon
  return <FileText className="h-5 w-5 text-gray-500" />;
}
