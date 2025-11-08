"use client";

import { File, Star, Trash } from "lucide-react";
import type { File as FileType } from "@/lib/db/schema";

interface FileTabsProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  files: FileType[];
  starredCount: number;
  trashCount: number;
}

export default function FileTabs({
  activeTab,
  onTabChange,
  files,
  starredCount,
  trashCount,
}: FileTabsProps) {
  // Compute tab data dynamically based on files
  const tabs = [
    {
      key: "all",
      label: "All Files",
      icon: File,
      color: "text-default-700",
      count: files.filter((file) => !file.isTrash).length,
      badgeStyle: "bg-default-200 text-default-800",
    },
    {
      key: "starred",
      label: "Starred",
      icon: Star,
      color: "text-yellow-600",
      count: starredCount,
      badgeStyle: "bg-yellow-100 text-yellow-800",
    },
    {
      key: "trash",
      label: "Trash",
      icon: Trash,
      color: "text-red-600",
      count: trashCount,
      badgeStyle: "bg-red-100 text-red-800",
    },
  ];

  return (
    <div className="overflow-x-auto sm:overflow-visible">
      <div className="flex flex-nowrap sm:flex-wrap gap-0 sm:gap-8 p-0 sm:p-0 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative flex items-center gap-1.5 py-3 px-3 transition-colors whitespace-nowrap border-b-2 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-default-600 hover:text-primary/70"
              }`}
            >
              <Icon
                className={`h-4 w-4 sm:h-5 sm:w-5 ${
                  isActive ? "text-primary" : tab.color
                }`}
              />
              <span
                className={`font-medium ${
                  isActive ? "text-primary" : "text-default-700"
                }`}
              >
                {tab.label}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tab.badgeStyle}`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
