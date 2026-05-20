// existed code
// "use client";
// import { useEffect, useState, useMemo, useCallback } from "react";
// import { Folder, Star, Trash, X, ExternalLink } from "lucide-react";
// import { formatDistanceToNow } from "date-fns";
// import type { File as FileType } from "@/lib/db/schema";
// import axios from "axios";

// import ConfirmationModal from "@/components/ui/ConfirmationModal";
// import FileEmptyState from "@/components/FileEmptyState";
// import FileIcon from "@/components/FileIcon";
// import FileActions from "@/components/FileAction";
// import FileLoadingState from "@/components/FileLoadingState";
// import FileTabs from "@/components/FileTabs";
// import FolderNavigation from "@/components/FolderNavigation";
// import FileActionButtons from "@/components/FileActionButtons";

// // types
// type ActiveTab = "all" | "starred" | "trash";
// interface FileListProps {
//   refreshTrigger?: number;
//   onFolderChange?: (folderId: string | null) => void;
//   onShare?: (file: FileType) => void;
//   search?: string;
// }

// export default function FileList({
//   refreshTrigger = 0,
//   onFolderChange,
//   onShare,
//   search,
// }: FileListProps) {
//   // state
//   const [files, setFiles] = useState<FileType[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [activeTab, setActiveTab] = useState<ActiveTab>("all");
//   const [currentFolder, setCurrentFolder] = useState<string | null>(null);
//   const [folderPath, setFolderPath] = useState<
//     Array<{ id: string; name: string }>
//   >([]);

//   // pagination
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const limit = 20;

//   // modals
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

//   // fetch files
//   const fetchFiles = useCallback(async () => {
//     setLoading(true);
//     try {
//       let url = `/api/files?page=${page}&limit=${limit}`;
//       if (currentFolder) url += `&parentId=${currentFolder}`;
//       if (search?.trim()) url += `&search=${encodeURIComponent(search)}`;

//       const res = await axios.get(url);
//       setFiles(res.data.files ?? []);
//       setTotalPages(res.data.totalPages ?? 1);
//     } catch (err) {
//       console.error("Error fetching files:", err);
//       setFiles([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [currentFolder, search, page]);

//   useEffect(() => {
//     fetchFiles();
//   }, [fetchFiles, refreshTrigger]);

//   // reset page when folder or search changes
//   useEffect(() => {
//     setPage(1);
//   }, [currentFolder, search]);

//   // filter files
//   const filteredFiles = useMemo(() => {
//     switch (activeTab) {
//       case "starred":
//         return files.filter((f) => f.isStarred && !f.isTrash);
//       case "trash":
//         return files.filter((f) => f.isTrash);
//       default:
//         return files.filter((f) => !f.isTrash);
//     }
//   }, [files, activeTab]);

//   const trashCount = files.filter((f) => f.isTrash).length;
//   const starredCount = files.filter((f) => f.isStarred && !f.isTrash).length;

//   // navigation
//   const navigateToFolder = (id: string, name: string) => {
//     setCurrentFolder(id);
//     setFolderPath((prev) => [...prev, { id, name }]);
//     onFolderChange?.(id);
//   };

//   const navigateUp = () => {
//     setFolderPath((prev) => {
//       const path = [...prev];
//       path.pop();
//       const newId = path.length ? path[path.length - 1].id : null;
//       setCurrentFolder(newId);
//       onFolderChange?.(newId);
//       return path;
//     });
//   };

//   const navigateToPathFolder = (index: number) => {
//     if (index < 0) {
//       setFolderPath([]);
//       setCurrentFolder(null);
//       onFolderChange?.(null);
//       return;
//     }
//     const path = folderPath.slice(0, index + 1);
//     setFolderPath(path);
//     setCurrentFolder(path[path.length - 1].id);
//     onFolderChange?.(path[path.length - 1].id);
//   };

//   // actions
//   const handleStar = async (file: FileType) => {
//     await axios.patch(`/api/files/${file.id}/star`, {
//       isStarred: !file.isStarred,
//     });
//     fetchFiles();
//   };

//   const handleTrash = async (file: FileType) => {
//     await axios.patch(`/api/files/${file.id}/trash`, {
//       isTrash: !file.isTrash,
//     });
//     fetchFiles();
//   };

//   // handle restore
//   // const handleRestore = async (file: FileType) => {
//   //   await axios.post("/api/files", { id: file.id, action: "restore" });
//   //   fetchFiles();
//   // };

//   const handleDeletePermanent = async (file: FileType) => {
//     await axios.delete(`/api/files/${file.id}/delete`);
//     fetchFiles();
//   };

//   const handleEmptyTrash = async () => {
//     await fetch("/api/files/empty-trash", { method: "DELETE" });
//     setFiles((prev) => prev.filter((f) => !f.isTrash));
//     setEmptyTrashModalOpen(false);
//   };

//   const handleItemClick = (file: FileType) => {
//     if (file.isFolder) return navigateToFolder(file.id, file.name);
//     if (file.type?.startsWith("image/") || file.type?.startsWith("video/")) {
//       return window.open(file.fileUrl, "_blank");
//     }

//     const link = document.createElement("a");
//     link.href = file.fileUrl;
//     link.download = file.name;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   if (loading) return <FileLoadingState />;

//   // ui
//   return (
//     <div className="space-y-6">
//       <FileTabs
//         activeTab={activeTab}
//         onTabChange={setActiveTab}
//         files={files}
//         starredCount={starredCount}
//         trashCount={trashCount}
//       />

//       {activeTab === "all" && (
//         <FolderNavigation
//           folderPath={folderPath}
//           navigateUp={navigateUp}
//           navigateToPathFolder={navigateToPathFolder}
//         />
//       )}

//       <FileActionButtons
//         activeTab={activeTab}
//         trashCount={trashCount}
//         folderPath={folderPath}
//         onRefresh={fetchFiles}
//         onEmptyTrash={() => setEmptyTrashModalOpen(true)}
//       />

//       <div className="border-b border-black my-4" />

//       {filteredFiles.length === 0 ? (
//         <FileEmptyState activeTab={activeTab} />
//       ) : (
//         <div className="overflow-x-auto border rounded-xl bg-base-100">
//           <table className="table table-zebra w-full">
//             <thead>
//               <tr>
//                 <th>Name</th>
//                 <th className="hidden sm:table-cell">Type</th>
//                 <th className="hidden md:table-cell">Size</th>
//                 <th className="hidden sm:table-cell">Added</th>
//                 <th className="w-56">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredFiles.map((file) => (
//                 <tr
//                   key={file.id}
//                   className="hover:bg-base-200 cursor-pointer"
//                   onClick={() => handleItemClick(file)}
//                 >
//                   <td>
//                     <div className="flex items-center gap-3">
//                       <FileIcon file={file} />
//                       <span className="truncate max-w-[300px]">
//                         {file.name}
//                       </span>
//                       {file.isStarred && (
//                         <Star className="h-4 w-4 text-yellow-400 fill-current" />
//                       )}
//                       {file.isFolder && (
//                         <Folder className="h-3 w-3 text-gray-400" />
//                       )}

//                       {file.type?.startsWith("image/") && (
//                         <ExternalLink className="h-3 w-3" />
//                       )}
//                     </div>
//                   </td>
//                   <td className="hidden sm:table-cell text-xs">
//                     {file.isFolder ? "Folder" : file.type}
//                   </td>
//                   <td className="hidden md:table-cell">
//                     {file.isFolder
//                       ? "-"
//                       : `${(file.size / 1024).toFixed(1)} KB`}
//                   </td>
//                   <td className="hidden sm:table-cell">
//                     {formatDistanceToNow(new Date(file.createdAt), {
//                       addSuffix: true,
//                     })}
//                   </td>
//                   <td onClick={(e) => e.stopPropagation()}>
//                     <FileActions
//                       file={file}
//                       onStar={() => handleStar(file)}
//                       onTrash={() => handleTrash(file)}
//                       onDelete={() => {
//                         setSelectedFile(file);
//                         setDeleteModalOpen(true);
//                       }}
//                       onShare={() => onShare?.(file)}
//                     />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* pagination */}
      // {totalPages > 1 && (
      //   <div className="flex justify-center gap-4 mt-6">
      //     <button
      //       className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      //       disabled={page === 1}
      //       onClick={() => setPage((p) => p - 1)}
      //     >
      //       Prev
      //     </button>

      //     <span className="flex justify-center items-center text-sm font-semibold">
      //       Page {page} of {totalPages}
      //     </span>
      //     <button
      //       className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      //       disabled={page === totalPages}
      //       onClick={() => setPage((p) => p + 1)}
      //     >
      //       Next
      //     </button>
      //   </div>
      // )}

//       {/* delete modal */}
//       <ConfirmationModal
//         isOpen={deleteModalOpen}
//         onOpenChange={setDeleteModalOpen}
//         title="Confirm Permanent Deletion"
//         description="Are you sure you want to permanently delete this file?"
//         icon={X}
//         iconColor="text-error"
//         confirmText="Delete Permanently"
//         confirmColor="danger"
//         onConfirm={() => selectedFile && handleDeletePermanent(selectedFile)}
//         isDangerous
//       />

//       {/* empty trash modal */}
//       <ConfirmationModal
//         isOpen={emptyTrashModalOpen}
//         onOpenChange={setEmptyTrashModalOpen}
//         title="Empty Trash"
//         description={"Are you sure you want to delete all ${trashCount} items?"}
//         icon={Trash}
//         iconColor="text-error"
//         confirmText="Empty Trash"
//         confirmColor="danger"
//         onConfirm={handleEmptyTrash}
//         isDangerous
//       />
//     </div>
//   );
// }
























// this is the code for global total it gives counting according to total files not per page count 

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
  userId: string,
  refreshTrigger?: number;
  onFolderChange?: (folderId: string | null) => void;
  onShare?: (file: FileType) => void;
  search?: string;
}

export default function FileList({
  userId,
  refreshTrigger = 0,
  onFolderChange,
  onShare,
  search,
}: FileListProps) {
  // -------------------- STATE --------------------
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // counts (GLOBAL, NOT tab-based)
  const [allCount, setAllCount] = useState(0);
  const [starredCount, setStarredCount] = useState(0);
  const [trashCount, setTrashCount] = useState(0);

  // modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  // -------------------- FETCH FILES (TAB BASED) --------------------
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/files?page=${page}&limit=${limit}&tab=${activeTab}`;

      if (currentFolder) url += `&parentId=${currentFolder}`;
      if (search?.trim()) url += `&search=${encodeURIComponent(search)}`;

      const res = await axios.get(url);
      setFiles(res.data.files ?? []);
      setTotalPages(res.data.totalPages ?? 1);
    } catch (err) {
      console.error("Error fetching files:", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, currentFolder, search]);

  // -------------------- FETCH COUNTS (GLOBAL) --------------------
  const fetchCounts = useCallback(async () => {
    try {
      const res = await axios.get("/api/files/counts");
      setAllCount(res.data.all);
      setStarredCount(res.data.starred);
      setTrashCount(res.data.trash);
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  }, []);

  // initial + refresh
  useEffect(() => {
    fetchFiles();
    fetchCounts();
  }, [fetchFiles, fetchCounts, refreshTrigger]);

  // reset page on tab / folder / search
  useEffect(() => {
    setPage(1);
  }, [activeTab, currentFolder, search]);

  // -------------------- FILTERED FILES --------------------
  // Backend already filtered — just use files directly
  const filteredFiles = useMemo(() => files, [files]);

  // -------------------- NAVIGATION --------------------
  const navigateToFolder = (id: string, name: string) => {
    setCurrentFolder(id);
    setFolderPath((prev) => [...prev, { id, name }]);
    onFolderChange?.(id);
  };

  const navigateUp = () => {
    setFolderPath((prev) => {
      const path = [...prev];
      path.pop();
      const newId = path.length ? path[path.length - 1].id : null;
      setCurrentFolder(newId);
      onFolderChange?.(newId);
      return path;
    });
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

  // -------------------- ACTIONS --------------------
  const handleStar = async (file: FileType) => {
    await axios.patch(`/api/files/${file.id}/star`, {
      isStarred: !file.isStarred,
    });
    fetchFiles();
    fetchCounts();
  };

  const handleTrash = async (file: FileType) => {
    await axios.patch(`/api/files/${file.id}/trash`, {
      isTrash: !file.isTrash,
    });
    fetchFiles();
    fetchCounts();
  };

  const handleDeletePermanent = async (file: FileType) => {
    await axios.delete(`/api/files/${file.id}/delete`);
    fetchFiles();
    fetchCounts();
  };

  const handleEmptyTrash = async () => {
    await axios.delete("/api/files/empty-trash");
    fetchFiles();
    fetchCounts();
    setEmptyTrashModalOpen(false);
  };

  const handleItemClick = (file: FileType) => {
    if (file.isFolder) return navigateToFolder(file.id, file.name);

    if (file.type?.startsWith("image/") || file.type?.startsWith("video/")) {
      return window.open(file.fileUrl, "_blank");
    }

    const link = document.createElement("a");
    link.href = file.fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <FileLoadingState />;

  // -------------------- UI --------------------
  return (
    <div className="space-y-6">
      <FileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        allCount={allCount}
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
        <div className="overflow-x-auto border rounded-xl bg-base-100">
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
              {filteredFiles.map((file) => (
                <tr
                  key={file.id}
                  className="hover:bg-base-200 cursor-pointer"
                  onClick={() => handleItemClick(file)}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <FileIcon file={file} />
                      <span className="truncate max-w-[300px]">
                        {file.name}
                      </span>
                      {file.isStarred && (
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      )}
                      {file.isFolder && (
                        <Folder className="h-3 w-3 text-gray-400" />
                      )}
                      {file.type?.startsWith("image/") && (
                        <ExternalLink className="h-3 w-3" />
                      )}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell text-xs">
                    {file.isFolder ? "Folder" : file.type}
                  </td>
                  <td className="hidden md:table-cell">
                    {file.isFolder
                      ? "-"
                      : `${(file.size / 1024).toFixed(1)} KB`}
                  </td>
                  <td className="hidden sm:table-cell">
                    {formatDistanceToNow(new Date(file.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <FileActions
                      file={file}
                      onStar={() => handleStar(file)}
                      onTrash={() => handleTrash(file)}
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

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>

          <span className="flex justify-center items-center text-sm font-semibold">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* delete modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirm Permanent Deletion"
        description="Are you sure you want to permanently delete this file?"
        icon={X}
        iconColor="text-error"
        confirmText="Delete Permanently"
        confirmColor="danger"
        onConfirm={() => selectedFile && handleDeletePermanent(selectedFile)}
        isDangerous
      />

      {/* empty trash modal */}
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








// this is the code for per page counting
// "use client";

// import { useEffect, useState, useMemo, useCallback } from "react";
// import { Folder, Star, Trash, X, ExternalLink } from "lucide-react";
// import { formatDistanceToNow } from "date-fns";
// import type { File as FileType } from "@/lib/db/schema";
// import axios from "axios";

// import ConfirmationModal from "@/components/ui/ConfirmationModal";
// import FileEmptyState from "@/components/FileEmptyState";
// import FileIcon from "@/components/FileIcon";
// import FileActions from "@/components/FileAction";
// import FileLoadingState from "@/components/FileLoadingState";
// import FileTabs from "@/components/FileTabs";
// import FolderNavigation from "@/components/FolderNavigation";
// import FileActionButtons from "@/components/FileActionButtons";

// type ActiveTab = "all" | "starred" | "trash";

// interface FileListProps {
//   refreshTrigger?: number;
//   onFolderChange?: (folderId: string | null) => void;
//   onShare?: (file: FileType) => void;
//   search?: string;
// }

// export default function FileList({
//   refreshTrigger = 0,
//   onFolderChange,
//   onShare,
//   search,
// }: FileListProps) {
//   const [files, setFiles] = useState<FileType[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [activeTab, setActiveTab] = useState<ActiveTab>("all");
//   const [currentFolder, setCurrentFolder] = useState<string | null>(null);
//   const [folderPath, setFolderPath] = useState<
//     Array<{ id: string; name: string }>
//   >([]);

//   // pagination
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const limit = 20;

//   // modals
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

//   // fetch files
//   const fetchFiles = useCallback(async () => {
//     setLoading(true);
//     try {
//       let url = `/api/files?page=${page}&limit=${limit}`;
//       if (currentFolder) url += `&parentId=${currentFolder}`;
//       if (search?.trim()) url += `&search=${encodeURIComponent(search)}`;
//       if (activeTab) url += `&tab=${activeTab}`;

//       const res = await axios.get(url);
//       setFiles(res.data.files ?? []);
//       setTotalPages(res.data.totalPages ?? 1);
//     } catch (err) {
//       console.error("Error fetching files:", err);
//       setFiles([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [currentFolder, search, page, activeTab]);

//   useEffect(() => {
//     fetchFiles();
//   }, [fetchFiles, refreshTrigger]);

//   // reset page when folder, search, or tab changes
//   useEffect(() => {
//     setPage(1);
//   }, [currentFolder, search, activeTab]);

//   // filter files for active tab
//   const filteredFiles = useMemo(() => {
//     switch (activeTab) {
//       case "starred":
//         return files.filter((f) => f.isStarred && !f.isTrash);
//       case "trash":
//         return files.filter((f) => f.isTrash);
//       default:
//         return files.filter((f) => !f.isTrash);
//     }
//   }, [files, activeTab]);

//   // counts for all tabs – always calculated from current page files
//   const allCount = files.filter((f) => !f.isTrash).length;
//   const starredCount = files.filter((f) => f.isStarred && !f.isTrash).length;
//   const trashCount = files.filter((f) => f.isTrash).length;

//   // navigation
//   const navigateToFolder = (id: string, name: string) => {
//     setCurrentFolder(id);
//     setFolderPath((prev) => [...prev, { id, name }]);
//     onFolderChange?.(id);
//   };

//   const navigateUp = () => {
//     setFolderPath((prev) => {
//       const path = [...prev];
//       path.pop();
//       const newId = path.length ? path[path.length - 1].id : null;
//       setCurrentFolder(newId);
//       onFolderChange?.(newId);
//       return path;
//     });
//   };

//   const navigateToPathFolder = (index: number) => {
//     if (index < 0) {
//       setFolderPath([]);
//       setCurrentFolder(null);
//       onFolderChange?.(null);
//       return;
//     }
//     const path = folderPath.slice(0, index + 1);
//     setFolderPath(path);
//     setCurrentFolder(path[path.length - 1].id);
//     onFolderChange?.(path[path.length - 1].id);
//   };

//   // actions
//   const handleStar = async (file: FileType) => {
//     await axios.patch(`/api/files/${file.id}/star`, {
//       isStarred: !file.isStarred,
//     });
//     fetchFiles();
//   };

//   const handleTrash = async (file: FileType) => {
//     await axios.patch(`/api/files/${file.id}/trash`, {
//       isTrash: !file.isTrash,
//     });
//     fetchFiles();
//   };

//   const handleDeletePermanent = async (file: FileType) => {
//     await axios.delete(`/api/files/${file.id}/delete`);
//     fetchFiles();
//   };

//   const handleEmptyTrash = async () => {
//     await fetch("/api/files/empty-trash", { method: "DELETE" });
//     setFiles((prev) => prev.filter((f) => !f.isTrash));
//     setEmptyTrashModalOpen(false);
//   };

//   const handleItemClick = (file: FileType) => {
//     if (file.isFolder) return navigateToFolder(file.id, file.name);
//     if (file.type?.startsWith("image/") || file.type?.startsWith("video/")) {
//       return window.open(file.fileUrl, "_blank");
//     }

//     const link = document.createElement("a");
//     link.href = file.fileUrl;
//     link.download = file.name;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   if (loading) return <FileLoadingState />;

//   return (
//     <div className="space-y-6">
//       {/* Tabs with counts */}
//       <FileTabs
//         activeTab={activeTab}
//         onTabChange={setActiveTab}
//         allCount={allCount}
//         starredCount={starredCount}
//         trashCount={trashCount}
//       />

//       {/* Folder navigation only for All tab */}
//       {activeTab === "all" && (
//         <FolderNavigation
//           folderPath={folderPath}
//           navigateUp={navigateUp}
//           navigateToPathFolder={navigateToPathFolder}
//         />
//       )}

//       <FileActionButtons
//         activeTab={activeTab}
//         trashCount={trashCount}
//         folderPath={folderPath}
//         onRefresh={fetchFiles}
//         onEmptyTrash={() => setEmptyTrashModalOpen(true)}
//       />

//       <div className="border-b border-black my-4" />

//       {filteredFiles.length === 0 ? (
//         <FileEmptyState activeTab={activeTab} />
//       ) : (
//         <div className="overflow-x-auto border rounded-xl bg-base-100">
//           <table className="table table-zebra w-full">
//             <thead>
//               <tr>
//                 <th>Name</th>
//                 <th className="hidden sm:table-cell">Type</th>
//                 <th className="hidden md:table-cell">Size</th>
//                 <th className="hidden sm:table-cell">Added</th>
//                 <th className="w-56">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredFiles.map((file) => (
//                 <tr
//                   key={file.id}
//                   className="hover:bg-base-200 cursor-pointer"
//                   onClick={() => handleItemClick(file)}
//                 >
//                   <td>
//                     <div className="flex items-center gap-3">
//                       <FileIcon file={file} />
//                       <span className="truncate max-w-[300px]">{file.name}</span>
//                       {file.isStarred && (
//                         <Star className="h-4 w-4 text-yellow-400 fill-current" />
//                       )}
//                       {file.isFolder && <Folder className="h-3 w-3 text-gray-400" />}
//                       {file.type?.startsWith("image/") && <ExternalLink className="h-3 w-3" />}
//                     </div>
//                   </td>
//                   <td className="hidden sm:table-cell text-xs">
//                     {file.isFolder ? "Folder" : file.type}
//                   </td>
//                   <td className="hidden md:table-cell">
//                     {file.isFolder ? "-" : `${(file.size / 1024).toFixed(1)} KB`}
//                   </td>
//                   <td className="hidden sm:table-cell">
//                     {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
//                   </td>
//                   <td onClick={(e) => e.stopPropagation()}>
//                     <FileActions
//                       file={file}
//                       onStar={() => handleStar(file)}
//                       onTrash={() => handleTrash(file)}
//                       onDelete={() => {
//                         setSelectedFile(file);
//                         setDeleteModalOpen(true);
//                       }}
//                       onShare={() => onShare?.(file)}
//                     />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* pagination */}
//       {totalPages > 1 && (
//         <div className="flex justify-center gap-4 mt-6">
//           <button
//             className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//             disabled={page === 1}
//             onClick={() => setPage((p) => p - 1)}
//           >
//             Prev
//           </button>

//           <span className="flex justify-center items-center text-sm font-semibold">
//             Page {page} of {totalPages}
//           </span>

//           <button
//             className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//             disabled={page === totalPages}
//             onClick={() => setPage((p) => p + 1)}
//           >
//             Next
//           </button>
//         </div>
//       )}

//       {/* delete modal */}
//       <ConfirmationModal
//         isOpen={deleteModalOpen}
//         onOpenChange={setDeleteModalOpen}
//         title="Confirm Permanent Deletion"
//         description="Are you sure you want to permanently delete this file?"
//         icon={X}
//         iconColor="text-error"
//         confirmText="Delete Permanently"
//         confirmColor="danger"
//         onConfirm={() => selectedFile && handleDeletePermanent(selectedFile)}
//         isDangerous
//       />

//       {/* empty trash modal */}
//       <ConfirmationModal
//         isOpen={emptyTrashModalOpen}
//         onOpenChange={setEmptyTrashModalOpen}
//         title="Empty Trash"
//         description={`Are you sure you want to delete all ${trashCount} items?`}
//         icon={Trash}
//         iconColor="text-error"
//         confirmText="Empty Trash"
//         confirmColor="danger"
//         onConfirm={handleEmptyTrash}
//         isDangerous
//       />
//     </div>
//   );
// }
