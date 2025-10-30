"use client";

import { RefreshCw, Trash } from "lucide-react";

interface FileActionButtonsProps {
  activeTab: string;
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
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
      <h2 className="text-xl sm:text-2xl font-semibold truncate max-w-full">
        {activeTab === "all" &&
          (folderPath.length > 0
            ? folderPath[folderPath.length - 1].name
            : "All Files")}
        {activeTab === "starred" && "Starred Files"}
        {activeTab === "trash" && "Trash"}
      </h2>

      <div className="flex gap-2 sm:gap-3 self-end sm:self-auto">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="flex flex-1 items-center gap-2 px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>

        {/* Empty Trash button */}
        {activeTab === "trash" && trashCount > 0 && (
          <button
            onClick={onEmptyTrash}
            className="flex flex-1 items-center gap-2 px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition"
          >
            <Trash className="h-4 w-4" />
            Empty 
          </button>
        )}
      </div>
    </div>
  );
}
