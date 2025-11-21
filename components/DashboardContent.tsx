
"use client";

import { useState, useCallback, useEffect } from "react";
import { FileUp, FileText, User } from "lucide-react";
import FileUploadForm from "@/components/FileUploadForm";
import FileList, { FileItem } from "@/components/FileList";
import UserProfile from "@/components/UserProfile";

interface DashboardContentProps {
  userId: string;
  userName: string;
  tab: string; 
  onTabChange?: (tab: string) => void;
}

export default function DashboardContent({
  userId,
  userName,
  tab,
  onTabChange,
}: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState(tab);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  // Sync activeTab if prop changes
  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    if (onTabChange) onTabChange(tabName);
  };

  const handleFileUploadSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleFolderChange = useCallback((folderId: string | null) => {
    setCurrentFolder(folderId);
  }, []);

  // Share logic
  const handleShare = (file: FileItem) => {
    if (!file.fileUrl) {
      alert("Cannot share: file URL is invalid.");
      return;
    }

    navigator.clipboard.writeText(file.fileUrl)
      .then(() => {
        alert(`File URL copied to clipboard:\n${file.name}`);
      })
      .catch((err) => {
        console.error("Failed to copy file URL:", err);
        alert("Failed to copy file URL.");
      });
  };

  return (
    <section className="p-6 space-y-6">
      <div>
        <h2 className="text-4xl font-bold text-gray-800">
          Hi,{" "}
          <span className="text-primary">
            {userName?.length > 10
              ? `${userName?.substring(0, 10)}...`
              : userName?.split(" ")[0] || "there"}
            !
          </span>
        </h2>
        <p className="text-gray-600 mt-2 text-lg">
          Your images are waiting for you.
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-bordered flex space-x-5 w-full max-w-xl">
        <button
          className={`tab tab-bordered text-lg ${
            activeTab === "files" ? "tab-active text-primary font-semibold" : ""
          }`}
          onClick={() => handleTabChange("files")}
        >
          <FileText className="w-5 h-5 mr-2" />
          My Files
        </button>

        <button
          className={`tab tab-bordered text-lg ${
            activeTab === "profile" ? "tab-active text-primary font-semibold" : ""
          }`}
          onClick={() => handleTabChange("profile")}
        >
          <User className="w-5 h-5 mr-2" />
          Profile
        </button>
      </div>

      <div className="border border-gray-300 mb-5" />

      {activeTab === "files" && (
        <div className="flex flex-col lg:flex-row gap-6 mt-4">
          <div className="lg:w-1/3">
            <div className="card bg-base-100 border border-black shadow-md hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-2">
                  <FileUp className="w-5 h-5 text-primary" />
                  <h2 className="card-title text-xl">Upload</h2>
                </div>
                <FileUploadForm
                  userId={userId}
                  onUploadSuccess={handleFileUploadSuccess}
                  currentFolder={currentFolder}
                />
              </div>
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="card bg-base-100 border border-black shadow-md hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="card-title text-xl">Your Files</h2>
                </div>
                <FileList
                  userId={userId}
                  refreshTrigger={refreshTrigger}
                  onFolderChange={handleFolderChange}
                  onShare={handleShare} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="mt-4">
          <UserProfile />
        </div>
      )}
    </section>
  );
}
