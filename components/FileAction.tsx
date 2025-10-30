"use client";

import { Star, Trash, X, ArrowUpFromLine, ExternalLink } from "lucide-react";
import type { File as FileType } from "@/lib/db/schema";


interface FileActionsProps {
  file: FileType;
  onStar: (id: string) => void;
  onTrash: (id: string) => void;
  onDelete: (file: FileType) => void;
  onShare: (file: FileType) => void;
}

export default function FileActions({
  file,
  onStar,
  onTrash,
  onDelete,
  onShare,
}: FileActionsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      {/* Share button  */}
      {!file.isTrash && !file.isFolder && (
        <button
          onClick={() => onShare(file)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium shadow-sm transition"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      )}

      {/* Star / Unstar button */}
      {!file.isTrash && (
        <button
          onClick={() => onStar(file.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium shadow-sm transition ${
            file.isStarred
              ? "bg-yellow-400 hover:bg-yellow-500 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          }`}
        >
          <Star
            className={`h-3.5 w-3.5 ${
              file.isStarred ? "fill-current" : "stroke-current"
            }`}
          />
          <span className="hidden sm:inline">
            {file.isStarred ? "Unstar" : "Star"}
          </span>
        </button>
      )}

      {/* Trash / Restore button */}
      <button
        onClick={() => onTrash(file.id)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium shadow-sm transition ${
          file.isTrash
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
      >
        {file.isTrash ? (
          <ArrowUpFromLine className="h-3.5 w-3.5" />
        ) : (
          <Trash className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">
          {file.isTrash ? "Restore" : "Delete"}
        </span>
      </button>

      {/* Delete permanently button */}
      {file.isTrash && (
        <button
          onClick={() => onDelete(file)}
          className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium shadow-sm transition"
        >
          <X className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Remove</span>
        </button>
      )}
    </div>
  );
}
