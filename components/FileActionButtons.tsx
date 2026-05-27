"use client";

import { RefreshCw, Trash2 } from "lucide-react";

interface FileActionButtonsProps {
  activeTab: "all" | "starred" | "trash";
  trashCount: number;
  folderPath: Array<{ id: string; name: string }>;
  onRefresh: () => void;
  onEmptyTrash: () => void;
}

export default function FileActionButtons({
  activeTab,
  trashCount,
  folderPath,
  onRefresh,
  onEmptyTrash,
}: FileActionButtonsProps) {
  const title =
    activeTab === "all"
      ? folderPath.length > 0
        ? folderPath[folderPath.length - 1].name
        : "All Files"
      : activeTab === "starred"
        ? "Starred Files"
        : "Trash";

  const subtitle =
    activeTab === "all"
      ? "Manage and organize your uploaded files"
      : activeTab === "starred"
        ? "Your favorite important files"
        : "Deleted files stored temporarily";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
          {title}
        </h2>

        <p className="text-sm text-zinc-400">{subtitle}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950/40 backdrop-blur-md border border-zinc-800 shadow-sm hover:shadow-md hover:bg-zinc-900/60 active:scale-[0.98] transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4 text-indigo-400" />
          <span className="text-sm font-medium text-zinc-200">Refresh</span>
        </button>

        {/* Empty Trash */}
        {activeTab === "trash" && (
          <button
            onClick={onEmptyTrash}
            disabled={trashCount === 0}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Trash2 className="h-4 w-4 text-red-400" />

            <span className="text-sm font-semibold text-red-300">
              Empty {trashCount > 0 ? `(${trashCount})` : ""}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
