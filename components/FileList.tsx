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
  refreshTrigger?: number;
  onFolderChange?: (folderId: string | null) => void;
  onShare?: (file: FileType) => void;
}

export default function FileList({
  userId,
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

  // --- Toast Helper ---
  const showToast = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const color =
      type === "success"
        ? "alert-success"
        : type === "error"
        ? "alert-error"
        : "alert-info";
    const toast = document.createElement("div");
    toast.className = "toast toast-top toast-end z-50";
    toast.innerHTML = `<div class="alert ${color} shadow-md"><span><b>${title}</b> - ${message}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // --- Fetch Files ---
  const fetchFiles = async () => {
    setLoading(true);
    try {
      let url = `/api/files?userId=${userId}`;
      if (currentFolder) url += `&parentId=${currentFolder}`;
      const res = await axios.get(url);
      const data = res.data;
      setFiles(Array.isArray(data) ? data : data.files ?? []);
    } catch (err) {
      console.error(err);
      showToast("Error", "Unable to load files.", "error");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger, currentFolder]);

  // --- Filter Tabs ---
  const filteredFiles = useMemo(() => {
    if (!Array.isArray(files)) return [];
    switch (activeTab) {
      case "starred":
        return files.filter((f) => f.isStarred && !f.isTrash);
      case "trash":
        return files.filter((f) => f.isTrash);
      default:
        return files.filter((f) => !f.isTrash);
    }
  }, [files, activeTab]);

  const trashCount = files.filter((f) => f.isTrash).length;
  const starredCount = files.filter((f) => f.isStarred && !f.isTrash).length;

  // --- Handlers ---
  const handleStarFile = async (fileId: string) => {
    try {
      await axios.patch(`/api/files/${fileId}/star`);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, isStarred: !f.isStarred } : f
        )
      );
      showToast("Star Updated", "File star status changed", "success");
    } catch {
      showToast("Error", "Failed to toggle star", "error");
    }
  };

  const handleTrashFile = async (fileId: string) => {
    try {
      const res = await axios.patch(`/api/files/${fileId}/trash`);
      const isTrash = res.data.isTrash;
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, isTrash: !f.isTrash } : f))
      );
      showToast(
        isTrash ? "Moved to Trash" : "Restored",
        isTrash ? "File moved to trash" : "File restored successfully",
        "info"
      );
    } catch {
      showToast("Error", "Failed to update file status", "error");
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await axios.delete(`/api/files/${fileId}/delete`);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      showToast("Deleted", "File permanently removed", "success");
      setDeleteModalOpen(false);
    } catch {
      showToast("Error", "Failed to delete file", "error");
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await axios.delete(`/api/files/empty-trash`);
      setFiles((prev) => prev.filter((f) => !f.isTrash));
      showToast("Trash Cleared", "All trash files deleted", "success");
      setEmptyTrashModalOpen(false);
    } catch {
      showToast("Error", "Failed to empty trash", "error");
    }
  };

  // --- Folder Navigation ---
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
    if (file.isFolder) navigateToFolder(file.id, file.name);
    else if (file.type?.startsWith("image/")) {
      const safeUrl = file.fileUrl?.startsWith("https://ik.imagekit.io/")
        ? file.fileUrl
        : file.path
        ? `https://ik.imagekit.io/phjustnhxv/${file.path}`
        : null;

      if (safeUrl) window.open(safeUrl, "_blank");
    }
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

      <div className="border-b border-black my-4" />

      {filteredFiles.length === 0 ? (
        <FileEmptyState activeTab={activeTab} />
      ) : (
        <div className="overflow-x-auto border border-base-300 rounded-xl bg-base-100">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th className="hidden sm:table-cell">Type</th>
                <th className="hidden md:table-cell">Size</th>
                <th className="hidden sm:table-cell">Added</th>
                <th className="w-56">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => {
                
                const safeUrl = file.fileUrl?.startsWith("https://ik.imagekit.io/")
                  ? file.fileUrl
                  : file.path
                  ? `https://ik.imagekit.io/phjustnhxv/${file.path}`
                  : null;

                return (
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
                          <div className="font-medium flex items-center gap-2">
                            <span className="truncate max-w-[200px] md:max-w-[300px]">
                              {file.name}
                            </span>
                            {file.isStarred && (
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            )}
                            {file.isFolder && (
                              <Folder className="h-3 w-3 text-gray-400" />
                            )}
                            {file.type?.startsWith("image/") && safeUrl && (
                              <ExternalLink className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 sm:hidden">
                            {formatDistanceToNow(new Date(file.createdAt), {
                              addSuffix: true,
                            })}
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
                        : file.size < 1024
                        ? `${file.size} B`
                        : file.size < 1024 * 1024
                        ? `${(file.size / 1024).toFixed(1)} KB`
                        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                    </td>
                    <td className="hidden sm:table-cell text-gray-700">
                      <div>
                        <div>
                          {formatDistanceToNow(new Date(file.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(new Date(file.createdAt), "MMMM d, yyyy")}
                        </div>
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <FileActions
                        file={file}
                        onStar={() => handleStarFile(file.id)}
                        onTrash={() => handleTrashFile(file.id)}
                        onDelete={() => {
                          setSelectedFile(file);
                          setDeleteModalOpen(true);
                        }}
                        onShare={() => {
                          if (!safeUrl) {
                            alert("This file cannot be shared.");
                            return;
                          }

                          navigator.clipboard
                            .writeText(safeUrl)
                            .then(() =>
                              alert(
                                `File "${file.name}" URL copied to clipboard:\n${safeUrl}`
                              )
                            )
                            .catch(() => alert("Failed to copy file URL."));
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirm Permanent Deletion"
        description="Are you sure you want to permanently delete this file?"
        icon={X}
        iconColor="text-error"
        confirmText="Delete Permanently"
        confirmColor="danger"
        onConfirm={() => selectedFile && handleDeleteFile(selectedFile.id)}
        isDangerous
      />

      <ConfirmationModal
        isOpen={emptyTrashModalOpen}
        onOpenChange={setEmptyTrashModalOpen}
        title="Empty Trash"
        description={`Are you sure you want to delete all ${trashCount} items?`}
        icon={Trash}
        iconColor="text-error"
        confirmText="Empty Trash"
        confirmColor="danger"
        onConfirm={handleEmptyTrash}
        isDangerous
      />
    </div>
  );
}
