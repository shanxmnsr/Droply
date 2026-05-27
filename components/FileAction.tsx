"use client";

import { Star, Trash, X, ArrowUpFromLine, ExternalLink } from "lucide-react";
import type { File as FileType } from "@/lib/db/schema";

interface FileActionsProps {
  file: FileType;
  onStar: (id: string) => void;
  onTrash: (id: string) => void;
  onDelete: (file: FileType) => void;
  onShare?: (file: FileType) => void;
}

export default function FileActions({
  file,
  onStar,
  onTrash,
  onDelete,
  onShare,
}: FileActionsProps) {
  return (
    <div className="flex items-center gap-2 justify-end flex-wrap">
      {/* Share */}
      {!file.isTrash && !file.isFolder && onShare && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(file);
          }}
          className="p-2 rounded-lg bg-white/60 hover:bg-blue-50 text-blue-600 border border-gray-200 hover:border-blue-200 transition shadow-sm"
          title="Share"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      )}

      {/* Star */}
      {!file.isTrash && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStar(file.id);
          }}
          className={`p-2 rounded-lg border transition shadow-sm ${
            file.isStarred
              ? "bg-yellow-100 text-yellow-600 border-yellow-300 hover:bg-yellow-200"
              : "bg-white/60 text-gray-600 border-gray-200 hover:bg-gray-100"
          }`}
          title={file.isStarred ? "Unstar" : "Star"}
        >
          <Star
            className={`h-4 w-4 ${file.isStarred ? "fill-yellow-500" : ""}`}
          />
        </button>
      )}

      {/* Trash / Restore */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTrash(file.id);
        }}
        className={`p-2 rounded-lg border transition shadow-sm ${
          file.isTrash
            ? "bg-green-100 text-green-600 border-green-300 hover:bg-green-200"
            : "bg-red-100 text-red-600 border-red-300 hover:bg-red-200"
        }`}
        title={file.isTrash ? "Restore" : "Move to Trash"}
      >
        {file.isTrash ? (
          <ArrowUpFromLine className="h-4 w-4" />
        ) : (
          <Trash className="h-4 w-4" />
        )}
      </button>

      {/* Delete permanently */}
      {file.isTrash && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file);
          }}
          className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
          title="Delete permanently"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
