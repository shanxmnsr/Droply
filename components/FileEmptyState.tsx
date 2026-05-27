"use client";

import { UploadCloud, Star, Trash2 } from "lucide-react";

interface FileEmptyStateProps {
  activeTab: "all" | "starred" | "trash";
}

export default function FileEmptyState({ activeTab }: FileEmptyStateProps) {
  const emptyStates = {
    all: {
      icon: UploadCloud,
      title: "No files yet",
      description: "Upload files to start organizing your workspace.",
    },
    starred: {
      icon: Star,
      title: "No starred files",
      description: "Star important files for quick access.",
    },
    trash: {
      icon: Trash2,
      title: "Trash is empty",
      description: "Deleted files will appear here temporarily.",
    },
  };

  const state = emptyStates[activeTab] || emptyStates.all;
  const Icon = state.icon;

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      
      {/* Icon */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <Icon className="h-7 w-7 text-sky-400" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-zinc-100">
        {state.title}
      </h3>

      {/* Description */}
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        {state.description}
      </p>
    </div>
  );
}