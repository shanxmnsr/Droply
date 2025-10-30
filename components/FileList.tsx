"use client";

import { useEffect, useState, useMemo } from "react";
import { Folder, Star, Trash, X, ExternalLink } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { File as FileType } from "@/lib/db/schema";
import axios from "axios";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import FileEmptyState from "@/components/FileEmptyState";
import FileIcon from "@/components/FileIcon";
import FileActions from "@/components/FileAction";
import FileLoadingState from "@/components/FileLoadingState";
import FileTabs from "@/components/FileTabs";
import FolderNavigation from "@/components/FolderNavigation";
import FileActionButtons from "@/components/FileActionButtons";

interface FileListProps {
  userId: string;
  refreshTrigger: number;
  onFolderChange: (folderId: string | null) => void;
}

export default function FileList({
  refreshTrigger = 0,
  onFolderChange,
}: FileListProps) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  // Toast helper
  const showToast = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const color =
      type === "success"
        ? "bg-green-100 text-green-800"
        : type === "error"
        ? "bg-red-100 text-red-800"
        : "bg-blue-100 text-blue-800";

    const toast = document.createElement("div");
    toast.className = `toast toast-top toast-end`;
    toast.innerHTML = `<div class="alert ${color} shadow-md"><span class="font-medium">${title}</span><p>${message}</p></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Fetch files safely
  const fetchFiles = async () => {
    setLoading(true);
    try {
      let url = "/api/files";
      if (currentFolder) url += `?parentId=${currentFolder}`;

      const response = await axios.get(url, { withCredentials: true });
      const data = response.data;

      // Normalize and validate files
      let validFiles: FileType[] = [];
      if (Array.isArray(data)) validFiles = data;
      else if (Array.isArray(data.files)) validFiles = data.files;
      else validFiles = [];

      // Filter out broken or undefined entries
      validFiles = validFiles.filter((f) => f && typeof f.id === "string");

      setFiles(validFiles);
    } catch (error: any) {
      console.error("Error fetching files:", error?.response?.data || error);
      showToast(
        "Error Loading Files",
        error?.response?.data?.error || "Could not load files.",
        "error"
      );
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger, currentFolder]);

  // Filter files for tabs safely
  const filteredFiles = useMemo(() => {
    if (!Array.isArray(files)) return [];
    switch (activeTab) {
      case "starred":
        return files.filter((file) => file?.isStarred && !file?.isTrash);
      case "trash":
        return files.filter((file) => file?.isTrash);
      default:
        return files.filter((file) => !file?.isTrash);
    }
  }, [files, activeTab]);

  const trashCount = files.filter((f) => f?.isTrash).length;
  const starredCount = files.filter((f) => f?.isStarred && !f?.isTrash).length;

  // Folder navigation
  const navigateToFolder = (id: string, name: string) => {
    setCurrentFolder(id);
    setFolderPath([...folderPath, { id, name }]);
    onFolderChange?.(id);
  };

  const navigateUp = () => {
    const path = [...folderPath];
    path.pop();
    const newId = path.length ? path[path.length - 1].id : null;
    setFolderPath(path);
    setCurrentFolder(newId);
    onFolderChange?.(newId);
  };

  const navigateToPathFolder = (index: number) => {
    if (index < 0) {
      setFolderPath([]);
      setCurrentFolder(null);
      onFolderChange?.(null);
      return;
    }
    const path = folderPath.slice(0, index + 1);
    setFolderPath(path);
    setCurrentFolder(path[path.length - 1].id);
    onFolderChange?.(path[path.length - 1].id);
  };

  const handleItemClick = (file: FileType) => {
    if (!file) return;
    if (file.isFolder) navigateToFolder(file.id, file.name);
    else if (file.type?.startsWith("image/") && file.fileUrl)
      window.open(file.fileUrl, "_blank");
  };

  if (loading) return <FileLoadingState />;

  return (
    <div className="space-y-6">
      <FileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        files={files}
        starredCount={starredCount}
        trashCount={trashCount}
      />

      {activeTab === "all" && (
        <FolderNavigation
          folderPath={folderPath}
          navigateUp={navigateUp}
          navigateToPathFolder={navigateToPathFolder}
        />
      )}

      <FileActionButtons
        activeTab={activeTab}
        trashCount={trashCount}
        folderPath={folderPath}
        onRefresh={fetchFiles}
        onEmptyTrash={() => setEmptyTrashModalOpen(true)}
      />

      <div className="border-b border-default-500 my-3" />

      {filteredFiles.length === 0 ? (
        <FileEmptyState activeTab={activeTab} />
      ) : (
        <div className="border border-base-200 bg-base-100 rounded-box overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th className="hidden sm:table-cell">Type</th>
                <th className="hidden md:table-cell">Size</th>
                <th className="hidden sm:table-cell">Added</th>
                <th className="w-60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr
                  key={file.id}
                  className={`hover:bg-base-200 transition-colors ${
                    file.isFolder || file.type?.startsWith("image/")
                      ? "cursor-pointer"
                      : ""
                  }`}
                  onClick={() => handleItemClick(file)}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <FileIcon file={file} />
                      <div>
                        <div className="font-medium flex items-center gap-2 text-base-content">
                          <span className="truncate max-w-[200px] md:max-w-[300px]">
                            {file.name}
                          </span>
                          {file.isStarred && (
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          )}
                          {file.isFolder && (
                            <Folder className="h-3 w-3 text-gray-400" />
                          )}
                          {file.type?.startsWith("image/") && (
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden">
                          {file.createdAt
                            ? formatDistanceToNow(new Date(file.createdAt), {
                                addSuffix: true,
                              })
                            : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell text-xs text-gray-500">
                    {file.isFolder ? "Folder" : file.type || "-"}
                  </td>
                  <td className="hidden md:table-cell text-gray-700">
                    {file.isFolder
                      ? "-"
                      : typeof file.size === "number"
                      ? file.size < 1024
                        ? `${file.size} B`
                        : file.size < 1024 * 1024
                        ? `${(file.size / 1024).toFixed(1)} KB`
                        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                      : "-"}
                  </td>
                  <td className="hidden sm:table-cell text-gray-700">
                    <div>
                      {file.createdAt && (
                        <>
                          <div>
                            {formatDistanceToNow(new Date(file.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(file.createdAt), "MMMM d, yyyy")}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <FileActions
                      file={file}
                      onStar={async (id) => {
                        try {
                          await axios.patch(`/api/files/${id}/star`);
                          showToast(
                            "Star Updated",
                            "File star status changed",
                            "success"
                          );
                          fetchFiles(); // refresh after update
                        } catch (err) {
                          console.error("Error starring file:", err);
                          showToast("Error", "Failed to toggle star", "error");
                        }
                      }}
                      onTrash={async (id) => {
                        try {
                          await axios.patch(`/api/files/${id}/trash`);
                          showToast(
                            "Moved to Trash",
                            "File moved successfully",
                            "info"
                          );
                          fetchFiles();
                        } catch (err) {
                          console.error("Error moving to trash:", err);
                          showToast(
                            "Error",
                            "Failed to move file to trash",
                            "error"
                          );
                        }
                      }}
                      onShare={async (file) => {
                        try {
                          await navigator.clipboard.writeText(file.fileUrl);
                          showToast(
                            "Link Copied!",
                            "You can share it anywhere.",
                            "success"
                          );
                        } catch (error) {
                          showToast("Error", "Failed to copy link.", "error");
                        }
                      }}
                      onDelete={async (file) => {
                        try {
                          await axios.delete(`/api/files/${file.id}/delete`);
                          showToast(
                            "File Removed",
                            `"${file.name}" deleted permanently.`,
                            "success"
                          );
                          fetchFiles();
                        } catch (error) {
                          console.error("Error deleting file:", error);
                          showToast("Error", "Failed to delete file.", "error");
                        }
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirm Permanent Deletion"
        description="This file will be gone forever. Proceed?"
        icon={X}
        iconColor="text-error"
        confirmText="Delete Permanently"
        confirmColor="danger"
        onConfirm={() => selectedFile && {}}
        isDangerous
      />

      {/* Empty trash modal */}
      <ConfirmationModal
        isOpen={emptyTrashModalOpen}
        onOpenChange={setEmptyTrashModalOpen}
        title="Empty Trash"
        description="Want to clear out the trash?"
        icon={Trash}
        iconColor="text-error"
        confirmText="Empty Trash"
        confirmColor="danger"
        onConfirm={() => {}}
        isDangerous
      />
    </div>
  );
}
