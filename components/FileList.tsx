"use client";

import { useEffect, useState, useCallback } from "react";
import { Folder, Star, Trash, X, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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

type ActiveTab = "all" | "starred" | "trash";

interface FileListProps {
  refreshTrigger?: number;
  onFolderChange?: (folderId: string | null) => void;
  onShare?: (file: FileType) => void;
  search?: string;
}

export default function FileList({
  refreshTrigger = 0,
  onFolderChange,
  onShare,
  search,
}: FileListProps) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const [folderPath, setFolderPath] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 20;

  const [allCount, setAllCount] = useState(0);
  const [starredCount, setStarredCount] = useState(0);
  const [trashCount, setTrashCount] = useState(0);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  /* Counts */

  const refreshCounts = useCallback(async () => {
    try {
      const res = await axios.get("/api/files/counts");

      setAllCount(res.data.all || 0);
      setStarredCount(res.data.starred || 0);
      setTrashCount(res.data.trash || 0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  /* Fetch Files */

  const fetchFiles = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        tab: activeTab,
      });

      if (currentFolder) {
        params.append("parentId", currentFolder);
      }

      if (search?.trim()) {
        params.append("search", search.trim());
      }

      const res = await axios.get(`/api/files?${params.toString()}`);

      setFiles(res.data.files ?? []);
      setTotalPages(res.data.totalPages ?? 1);
    } catch (err) {
      console.error(err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, currentFolder, search]);

  /* Refresh */

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchFiles(), refreshCounts()]);
  }, [fetchFiles, refreshCounts]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll, refreshTrigger]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, currentFolder, search]);

  /* Folder Navigation */

  const navigateToFolder = (id: string, name: string) => {
    setCurrentFolder(id);
    setFolderPath((prev) => [...prev, { id, name }]);
    onFolderChange?.(id);
  };

  const navigateUp = () => {
    setFolderPath((prev) => {
      const next = prev.slice(0, -1);

      const newId = next.length ? next[next.length - 1].id : null;

      setCurrentFolder(newId);
      onFolderChange?.(newId);

      return next;
    });
  };

  const navigateToPathFolder = (index: number) => {
    const next = folderPath.slice(0, index + 1);

    const newId = next[index]?.id ?? null;

    setFolderPath(next);
    setCurrentFolder(newId);

    onFolderChange?.(newId);
  };

  /* Actions */

  // star
  const toggleStar = async (file: FileType) => {
    const newValue = !file.isStarred;

    const updatedFile = {
      ...file,
      isStarred: newValue,
      updatedAt: new Date(),
    };

    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== file.id);
      if (newValue) {
        return [updatedFile, ...filtered];
      }

      return [...filtered, updatedFile];
    });

    try {
      await axios.patch(`/api/files/${file.id}/star`, {
        isStarred: newValue,
      });

      refreshCounts();
    } catch (err) {
      console.error(err);

      refreshAll();
    }
  };

  // trash
  const toggleTrash = async (file: FileType) => {
    const newValue = !file.isTrash;

    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, isTrash: newValue } : f)),
    );

    try {
      await axios.patch(`/api/files/${file.id}/trash`, {
        isTrash: newValue,
      });

      refreshCounts();
    } catch (err) {
      console.error(err);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, isTrash: file.isTrash } : f,
        ),
      );
    }
  };

  // delete parmanently
  const deletePermanent = async (file: FileType) => {
    await axios.delete(`/api/files/${file.id}/delete`);

    setDeleteModalOpen(false);
    setSelectedFile(null);

    refreshAll();
  };

  const emptyTrash = async () => {
    await axios.delete("/api/files/empty-trash");

    setEmptyTrashModalOpen(false);

    refreshAll();
  };

  /* Open File */

  const handleItemClick = (file: FileType) => {
    if (file.isFolder) {
      return navigateToFolder(file.id, file.name);
    }

    if (file.type?.startsWith("image/") || file.type?.startsWith("video/")) {
      window.open(file.fileUrl, "_blank");
      return;
    }

    const a = document.createElement("a");
    a.href = file.fileUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const visibleFiles = [...files]
    .filter((file) => {
      if (activeTab === "trash") return file.isTrash;

      if (activeTab === "starred") {
        return file.isStarred && !file.isTrash;
      }

      return !file.isTrash;
    })
    .sort((a, b) => {
      if (activeTab === "starred") {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }

      if (activeTab === "trash") {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  /* Loading  */
  if (loading) {
    return <FileLoadingState />;
  }

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Tabs */}
      <FileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        allCount={allCount}
        starredCount={starredCount}
        trashCount={trashCount}
      />

      {/* Folder Navigation */}
      {activeTab === "all" && (
        <FolderNavigation
          folderPath={folderPath}
          navigateUp={navigateUp}
          navigateToPathFolder={navigateToPathFolder}
        />
      )}

      {/* Actions */}
      <FileActionButtons
        activeTab={activeTab}
        trashCount={trashCount}
        folderPath={folderPath}
        onRefresh={refreshAll}
        onEmptyTrash={() => setEmptyTrashModalOpen(true)}
      />

      <div className="border-t border-zinc-800/60" />

      {/* Empty State */}
      {visibleFiles.length === 0 ? (
        <FileEmptyState activeTab={activeTab} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm">
          <table className="w-full">
            <thead className="bg-zinc-900/60 text-zinc-400">
              <tr className="border-b border-zinc-800/60">
                <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Name
                </th>
                <th className="hidden px-5 py-4 text-left text-xs font-medium uppercase tracking-wider sm:table-cell">
                  Type
                </th>
                <th className="hidden px-5 py-4 text-left text-xs font-medium uppercase tracking-wider md:table-cell">
                  Size
                </th>
                <th className="hidden px-5 py-4 text-left text-xs font-medium uppercase tracking-wider sm:table-cell">
                  Added
                </th>
                <th className="w-56 px-5 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleFiles.map((file) => (
                <tr
                  key={file.id}
                  onClick={() => handleItemClick(file)}
                  className="cursor-pointer border-b border-zinc-800/50 hover:bg-indigo-500/5"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <FileIcon file={file} />
                      <span className="text-sm font-medium text-zinc-100 truncate max-w-[260px]">
                        {file.name}
                      </span>

                      {file.isStarred && (
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      )}

                      {file.isFolder && (
                        <Folder className="h-3 w-3 text-sky-400" />
                      )}

                      {file.type?.startsWith("image/") && (
                        <ExternalLink className="h-3 w-3 text-indigo-400" />
                      )}
                    </div>
                  </td>

                  <td className="hidden px-5 py-4 text-sm text-zinc-400 sm:table-cell">
                    {file.isFolder ? "Folder" : file.type}
                  </td>

                  <td className="hidden px-5 py-4 text-sm text-zinc-400 md:table-cell">
                    {file.isFolder
                      ? "-"
                      : `${(file.size / 1024).toFixed(1)} KB`}
                  </td>

                  <td className="hidden px-5 py-4 text-sm text-zinc-400 sm:table-cell">
                    {formatDistanceToNow(new Date(file.createdAt), {
                      addSuffix: true,
                    })}
                  </td>

                  <td
                    onClick={(e) => e.stopPropagation()}
                    className="px-5 py-4"
                  >
                    <FileActions
                      file={file}
                      onStar={() => toggleStar(file)}
                      onTrash={() => toggleTrash(file)}
                      onDelete={() => {
                        setSelectedFile(file);
                        setDeleteModalOpen(true);
                      }}
                      onShare={() => onShare?.(file)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-5 py-2.5 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 transition disabled:opacity-40"
          >
            Prev
          </button>

          <span className=" text-center text-sm text-zinc-400">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-5 py-2.5 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 transition disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirm Permanent Deletion"
        description="Are you sure you want to permanently delete this file?"
        icon={X}
        iconColor="text-red-500"
        confirmText="Delete Permanently"
        confirmColor="danger"
        onConfirm={() => selectedFile && deletePermanent(selectedFile)}
        isDangerous
      />

      <ConfirmationModal
        isOpen={emptyTrashModalOpen}
        onOpenChange={setEmptyTrashModalOpen}
        title="Empty Trash"
        description={`Are you sure you want to delete all ${trashCount} items?`}
        icon={Trash}
        iconColor="text-red-500"
        confirmText="Empty Trash"
        confirmColor="danger"
        onConfirm={emptyTrash}
        isDangerous
      />
    </div>
  );
}
