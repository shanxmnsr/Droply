"use client";

import { ArrowUpFromLine } from "lucide-react";

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
    <div className="flex flex-wrap items-center gap-2 text-sm overflow-x-auto pb-2">
      {/* Navigate Up Button */}
      <button
        onClick={navigateUp}
        disabled={folderPath.length === 0}
        className={`p-1 rounded hover:bg-default-100 transition ${folderPath.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        title="Go up"
      >
        <ArrowUpFromLine className="h-4 w-4" />
      </button>

      {/* Home Button */}
      <button
        onClick={() => navigateToPathFolder(-1)}
        className={`p-1 rounded hover:bg-default-100 transition ${folderPath.length === 0 ? "font-bold" : ""}`}
      >
        Home
      </button>

      {/* Folder Path */}
      {folderPath.map((folder, index) => (
        <div key={folder.id} className="flex items-center">
          <span className="mx-1 text-default-400">/</span>
          <button
            onClick={() => navigateToPathFolder(index)}
            className={`p-1 rounded hover:bg-default-100 transition overflow-hidden text-ellipsis max-w-[150px] ${index === folderPath.length - 1 ? "font-bold" : ""}`}
            title={folder.name}
          >
            {folder.name}
          </button>
        </div>
      ))}
    </div>
  );
}
