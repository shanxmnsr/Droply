"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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

// Export type for parent usage
export type FileItem = FileType;

interface FileListProps {
  userId: string;
  refreshTrigger?: number;
  onFolderChange?: (folderId: string | null) => void;
  onShare?: (file: FileItem) => void;
}

export default function FileList({
  refreshTrigger = 0,
  onFolderChange,
  onShare,
}: FileListProps) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<Array<{ id: string; name: string }>>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  /** FETCH FILES */
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/files`;
      if (currentFolder) url += `?parentId=${currentFolder}`;

      const res = await axios.get(url);
      const fetchedFiles: FileType[] = Array.isArray(res.data) ? res.data : res.data.files ?? [];

      // Remove duplicates by id
      const uniqueFilesMap = new Map<string, FileType>();
      fetchedFiles.forEach((f) => uniqueFilesMap.set(f.id, f));
      const uniqueFiles = Array.from(uniqueFilesMap.values());

      // Sort by newest first
      uniqueFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setFiles(uniqueFiles);
    } catch (err: unknown) {
      console.error("Error fetching files:", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshTrigger]);

  /** FILTER FILES */
  const filteredFiles = useMemo(() => {
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

  /** NAVIGATION */
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

  /** STAR/TRASH/DELETE HANDLERS */
  const handleStar = async (file: FileType) => {
    try {
      await axios.patch(`/api/files/${file.id}/star`, { isStarred: !file.isStarred });
      fetchFiles();
    } catch (err: unknown) { console.error(err); }
  };

  const handleTrash = async (file: FileType) => {
    try {
      await axios.patch(`/api/files/${file.id}/trash`, { isTrash: !file.isTrash });
      fetchFiles();
    } catch (err: unknown) { console.error(err); }
  };

  const handleDeletePermanent = async (file: FileType) => {
    try {
      await axios.delete(`/api/files/${file.id}/delete`);
      fetchFiles();
    } catch (err: unknown) { console.error(err); }
  };

  /** ITEM CLICK */
  const handleItemClick = (file: FileType) => {
    if (file.isFolder) return navigateToFolder(file.id, file.name);
    if (file.type?.startsWith("image/") || file.type?.startsWith("video/")) {
      return window.open(file.fileUrl, "_blank");
    }
    // download other files
    const link = document.createElement("a");
    link.href = file.fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                const safeUrl = file.fileUrl;
                return (
                  <tr
                    key={file.id}
                    className={`hover:bg-base-200 transition-colors ${
                      file.isFolder || file.type?.startsWith("image/") ? "cursor-pointer" : ""
                    }`}
                    onClick={() => handleItemClick(file)}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <FileIcon file={file} />
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <span className="truncate max-w-[200px] md:max-w-[300px]">{file.name}</span>
                            {file.isStarred && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                            {file.isFolder && <Folder className="h-3 w-3 text-gray-400" />}
                            {file.type?.startsWith("image/") && safeUrl && <ExternalLink className="h-3 w-3 text-gray-400" />}
                          </div>
                          <div className="text-xs text-gray-500 sm:hidden">
                            {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="hidden sm:table-cell text-xs text-gray-500">{file.isFolder ? "Folder" : file.type || "-"}</td>
                    <td className="hidden md:table-cell text-gray-700">
                      {file.isFolder ? "-" : file.size < 1024 ? `${file.size} B` : file.size < 1024*1024 ? `${(file.size/1024).toFixed(1)} KB` : `${(file.size/(1024*1024)).toFixed(1)} MB`}
                    </td>
                    <td className="hidden sm:table-cell text-gray-700">
                      <div>
                        <div>{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}</div>
                        <div className="text-xs text-gray-500 mt-1">{format(new Date(file.createdAt), "MMMM d, yyyy")}</div>
                      </div>
                    </td>

                    <td onClick={(e) => e.stopPropagation()}>
                      <FileActions
                        file={file}
                        onStar={() => handleStar(file)}
                        onTrash={() => handleTrash(file)}
                        onDelete={() => { setSelectedFile(file); setDeleteModalOpen(true); }}
                        onShare={() => onShare?.(file)}
                        onDownload={() => {
                          if (!file.fileUrl) return alert("Invalid file URL.");
                          fetch(file.fileUrl).then(res => res.blob()).then(blob => {
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = file.name;
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            window.URL.revokeObjectURL(url);
                          }).catch(() => alert("Failed to download file."));
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
        onConfirm={() => { if (selectedFile) handleDeletePermanent(selectedFile); }}
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
        onConfirm={() => {}}
        isDangerous
      />
    </div>
  );
}
