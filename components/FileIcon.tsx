"use client";

import type { File as FileType } from "@/lib/db/schema";
import AppImage from "@/components/AppImage";

import {
  Folder,
  FileText,
  Play,
  FileArchive,
  Image as ImageIcon,
  Music2,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";

interface FileIconProps {
  file: FileType;
}

export default function FileIcon({ file }: FileIconProps) {
  const baseClass =
    "flex h-14 w-14 items-center justify-center rounded-2xl border";

  // Folder
  if (file.isFolder) {
    return (
      <div className={`${baseClass} border-indigo-500/20 bg-indigo-500/10`}>
        <Folder className="h-6 w-6 text-sky-400" />
      </div>
    );
  }

  const fileType = file.type?.split("/")[0];

  // Image Preview
  if (fileType === "image") {
    return (
      <div className="group relative h-14 w-14 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        {file.fileUrl ? (
          <AppImage
            src={file.fileUrl}
            alt={file.name}
            fill
            sizes="56px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-5 w-5 text-zinc-500" />
          </div>
        )}
      </div>
    );
  }

  // Video
  if (fileType === "video") {
    return (
      <div className={`${baseClass} border-purple-500/20 bg-purple-500/10`}>
        <Play className="h-5 w-5 text-purple-400" />
      </div>
    );
  }

  // Audio
  if (fileType === "audio") {
    return (
      <div className={`${baseClass} border-pink-500/20 bg-pink-500/10`}>
        <Music2 className="h-5 w-5 text-pink-400" />
      </div>
    );
  }

  // PDF
  if (file.type?.includes("pdf")) {
    return (
      <div className={`${baseClass} border-red-500/20 bg-red-500/10`}>
        <FileText className="h-5 w-5 text-red-400" />
      </div>
    );
  }

  // Spreadsheet
  if (
    file.type?.includes("sheet") ||
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".csv")
  ) {
    return (
      <div className={`${baseClass} border-green-500/20 bg-green-500/10`}>
        <FileSpreadsheet className="h-5 w-5 text-green-400" />
      </div>
    );
  }

  // Code Files
  if (
    file.name.endsWith(".js") ||
    file.name.endsWith(".ts") ||
    file.name.endsWith(".tsx") ||
    file.name.endsWith(".jsx") ||
    file.name.endsWith(".json")
  ) {
    return (
      <div className={`${baseClass} border-cyan-500/20 bg-cyan-500/10`}>
        <FileCode className="h-5 w-5 text-cyan-400" />
      </div>
    );
  }

  // Archive / Application Files
  if (fileType === "application") {
    return (
      <div className={`${baseClass} border-orange-500/20 bg-orange-500/10`}>
        <FileArchive className="h-5 w-5 text-orange-400" />
      </div>
    );
  }

  // Default
  return (
    <div className={`${baseClass} border-zinc-800 bg-zinc-900`}>
      <FileText className="h-5 w-5 text-zinc-400" />
    </div>
  );
}
