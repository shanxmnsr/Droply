"use client";

import { Folder, FileText, Image, Video } from "lucide-react";
import { IKImage } from "imagekitio-react";
import type { File as FileType } from "@/lib/db/schema";

interface FileIconProps {
  file: FileType;
}

export default function FileIcon({ file }: FileIconProps) {
  if (file.isFolder)
    return (
      <div className="flex items-center justify-center">
        <Folder className="h-6 w-6 text-blue-500" />
      </div>
    );

  const fileType = file.type.split("/")[0];

  switch (fileType) {
    case "image":
      return (
        <div className="h-12 w-12 relative overflow-hidden rounded-lg border border-base-300 bg-base-200">
          <IKImage
            path={file.path}
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
        </div>
      );

    case "application":
      if (file.type.includes("pdf"))
        return (
          <div className="flex items-center justify-center">
            <FileText className="h-6 w-6 text-error" />
          </div>
        );
      return (
        <div className="flex items-center justify-center">
          <FileText className="h-6 w-6 text-warning" />
        </div>
      );

    case "video":
      return (
        <div className="flex items-center justify-center">
          <Video className="h-6 w-6 text-purple-500" />
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center">
          <FileText className="h-6 w-6 text-gray-500" />
        </div>
      );
  }
}
