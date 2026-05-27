"use client";

import { ArrowUp, Home, ChevronRight, Folder } from "lucide-react";

interface FolderNavigationProps {
  folderPath: Array<{ id: string; name: string }>;
  navigateUp: () => void;
  navigateToPathFolder: (index: number) => void;
}

export default function FolderNavigation({
  folderPath,
  navigateUp,
  navigateToPathFolder,
}: FolderNavigationProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-sm overflow-x-auto scrollbar-hide">
      {/* Up */}
      <button
        onClick={navigateUp}
        disabled={folderPath.length === 0}
        className={`p-2 rounded-lg transition hover:bg-white/10 active:scale-95
          ${
            folderPath.length === 0
              ? "opacity-40 cursor-not-allowed"
              : "text-zinc-300"
          }`}
        title="Go up"
      >
        <ArrowUp className="h-4 w-4" />
      </button>

      {/* Home */}
      <button
        onClick={() => navigateToPathFolder(-1)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition hover:bg-white/10 active:scale-95 text-sm
          ${
            folderPath.length === 0
              ? "bg-indigo-500/10 text-indigo-400 font-medium"
              : "text-zinc-300"
          }`}
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </button>

      {/* Breadcrumbs */}
      {folderPath.map((folder, index) => {
        const isLast = index === folderPath.length - 1;

        return (
          <div key={folder.id} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-zinc-600" />

            <button
              onClick={() => navigateToPathFolder(index)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition max-w-[160px] truncate text-sm hover:bg-white/10 active:scale-95
                ${
                  isLast
                    ? "bg-indigo-500/10 text-indigo-400 font-medium"
                    : "text-zinc-400"
                }`}
              title={folder.name}
            >
              <Folder className="h-4 w-4" />
              <span className="truncate">{folder.name}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
