"use client";

import type { File as FileType } from "@/lib/db/schema";
import AppImage from "@/components/AppImage";
import {
  FileText,
  Image as ImageIcon,
  PlayCircle,
  FileArchive,
} from "lucide-react";

interface FileGalleryProps {
  files: FileType[];
}

export default function FileGallery({ files }: FileGalleryProps) {
  const getFileIcon = (type?: string) => {
    if (!type) return FileText;
    if (type.startsWith("image/")) return ImageIcon;
    if (type.startsWith("video/")) return PlayCircle;
    return FileArchive;
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {files.map((file) => {
        const FileIcon = getFileIcon(file.type);

        const previewUrl =
          file.type?.startsWith("video/") && file.thumbnailUrl
            ? file.thumbnailUrl
            : file.fileUrl;

        return (
          <div
            key={file.id}
            className="group overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/50 transition-all duration-200 hover:border-indigo-500/30 hover:-translate-y-1"
          >
            {/* Preview */}
            <div className="relative aspect-square overflow-hidden bg-zinc-950">
              {previewUrl ? (
                <>
                  <AppImage
                    src={previewUrl}
                    alt={file.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />

                  {/* Video Badge */}
                  {file.type?.startsWith("video/") && (
                    <div className="absolute right-3 top-3 rounded-lg bg-black/60 p-2 backdrop-blur-sm">
                      <PlayCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-zinc-500">
                  <FileIcon className="h-10 w-10" />
                  <span className="text-xs">No Preview</span>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex items-start gap-3 p-4">
              <div className="rounded-lg bg-indigo-500/10 p-2 border border-indigo-500/20">
                <FileIcon className="h-4 w-4 text-sky-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-100">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  {file.type?.split("/")[1]?.toUpperCase() || "FILE"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
