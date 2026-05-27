"use client";

import { useState, useCallback, useEffect } from "react";
import { FileUp, FileText, User, Search } from "lucide-react";
import FileUploadForm from "@/components/FileUploadForm";
import FileList from "@/components/FileList";
import UserProfile from "@/components/UserProfile";
import type { File as FileType } from "@/lib/db/schema";
import { toast } from "react-hot-toast";

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
  const [search, setSearch] = useState("");

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    onTabChange?.(tabName);
  };

  const handleFileUploadSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleFolderChange = useCallback((folderId: string | null) => {
    setCurrentFolder(folderId);
  }, []);

  const handleShare = (file: FileType) => {
    if (!file.fileUrl) {
      toast.error("Invalid file URL");
      return;
    }

    navigator.clipboard
      .writeText(file.fileUrl)
      .then(() => toast.success(`Copied: ${file.name}`))
      .catch(() => toast.error("Copy failed"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-default-50 text-white overflow-hidden">
      {/* BACKGROUND GLOW */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-500/10 blur-3xl rounded-full" />
      </div>

      <section className="relative z-10 space-y-8">
        {/* HERO HEADER */}
        <div className="relative mb-10">
          <div className="relative">
            <div className="space-y-3 mb-6 ml-10 mt-20 ">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Hi,{" "}
                <span className="text-indigo-400">
                  {userName?.length > 10
                    ? `${userName.substring(0, 10)}...`
                    : userName?.split(" ")[0] || "there"}
                  !
                </span>
              </h2>

              <p className="text-white/60 text-md max-w-2xl leading-relaxed">
                Your files are organized and ready.
              </p>
            </div>

            {/* TABS */}
            <div className="inline-flex items-center gap-2 p-1 ml-10 mb-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <button
                onClick={() => handleTabChange("files")}
                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${
                  activeTab === "files"
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-400/20"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileText size={16} />
                Files
              </button>

              <button
                onClick={() => handleTabChange("profile")}
                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${
                  activeTab === "profile"
                    ? "bg-sky-500/15 text-sky-300 border border-sky-400/20"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <User size={16} />
                Profile
              </button>
            </div>
          </div>
        </div>

        {/* FILES TAB */}
        {activeTab === "files" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* UPLOAD CARD */}
            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-indigo-500/20 to-transparent blur-sm" />

              <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FileUp className="text-indigo-400" />
                  <h3 className=" font-semibold text-xl">Upload Files</h3>
                </div>

                <FileUploadForm
                  userId={userId}
                  onUploadSuccess={handleFileUploadSuccess}
                  currentFolder={currentFolder}
                />
              </div>
            </div>

            {/* FILE LIST CARD */}
            <div className="lg:col-span-2 relative group">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-sky-500/20 to-transparent blur-sm" />

              <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="text-sky-400" />
                  <h3 className="font-semibold text-xl">Your Files</h3>
                </div>

                {/* SEARCH */}
                <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-xl border border-white/10 bg-white/5">
                  <Search size={16} className="text-white/40" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search your files..."
                    className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/40"
                  />
                </div>

                <FileList
                  refreshTrigger={refreshTrigger}
                  onFolderChange={handleFolderChange}
                  onShare={handleShare}
                  search={search}
                />
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="relative group">
            <UserProfile />
          </div>
        )}
      </section>
    </div>
  );
}
