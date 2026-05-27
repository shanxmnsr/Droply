"use client";

import { File, Star, Trash } from "lucide-react";

interface FileTabsProps {
  activeTab: "all" | "starred" | "trash";
  onTabChange: (key: "all" | "starred" | "trash") => void;
  allCount: number;
  starredCount: number;
  trashCount: number;
}

export default function FileTabs({
  activeTab,
  onTabChange,
  allCount,
  starredCount,
  trashCount,
}: FileTabsProps) {
  const tabs = [
    {
      key: "all" as const,
      label: "All Files",
      icon: File,
      count: allCount,
    },
    {
      key: "starred" as const,
      label: "Starred",
      icon: Star,
      count: starredCount,
    },
    {
      key: "trash" as const,
      label: "Trash",
      icon: Trash,
      count: trashCount,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="flex w-max items-center gap-2 rounded-2xl border border-zinc-800/70 bg-zinc-900/50 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200
                          ${
                            isActive
                              ? "bg-indigo-500/10 text-zinc-100 border border-indigo-500/20"
                              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                          }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive ? "text-sky-400" : "text-zinc-500"
                }`}
              />

              <span>{tab.label}</span>

              <span
                className={`rounded-full px-2 py-0.5 text-xs
                            ${
                              isActive
                                ? "bg-indigo-500/15 text-indigo-300"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
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
