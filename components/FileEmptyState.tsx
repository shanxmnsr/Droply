"use client";

import { File } from "lucide-react";

interface FileEmptyStateProps {
  activeTab: string;
}

export default function FileEmptyState({ activeTab }: FileEmptyStateProps) {
  return (
    <div className="card border border-base-300 bg-base-200 shadow-sm">
      <div className="card-body text-center py-16">
        <File className="h-16 w-16 mx-auto text-primary/50 mb-6" />
        <h3 className="text-xl font-semibold mb-2 text-base-content">
          {activeTab === "all" && "No files available"}
          {activeTab === "starred" && "No starred files"}
          {activeTab === "trash" && "Trash is empty"}
        </h3>
        <p className="text-base-content/60 mt-2 max-w-md mx-auto">
          {activeTab === "all" &&
            "Upload your first file to get started with your personal cloud storage."}
          {activeTab === "starred" &&
            "Mark important files with a star to find them quickly when you need them."}
          {activeTab === "trash" &&
            "Files you delete will appear here for 30 days before being permanently removed."}
        </p>
      </div>
    </div>
  );
}
