"use client";

import { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FileUp,
  X,
  AlertTriangle,
  FolderPlus,
  ArrowRight,
  Upload,
} from "lucide-react";

import ConfirmationModal from "./ui/ConfirmationModal";

interface FileUploadFormProps {
  userId: string;
  onUploadSuccess?: () => void;
  currentFolder?: string | null;
}

// Limits
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export default function FileUploadForm({
  userId,
  onUploadSuccess,
  currentFolder = null,
}: FileUploadFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // folder modal
  const [folderName, setFolderName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // size error modal
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [sizeErrorMessage, setSizeErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  /** Add files with validation and duplicate check */
  const addFiles = (newFiles: File[]) => {
    const duplicates: string[] = [];

    const validFiles = newFiles.filter((file) => {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      // Size validation
      if (isImage && file.size > MAX_IMAGE_SIZE) {
        setSizeErrorMessage(`Image "${file.name}" exceeds 5MB limit`);
        setSizeModalOpen(true);
        return false;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        setSizeErrorMessage(`Video "${file.name}" exceeds 100MB limit`);
        setSizeModalOpen(true);
        return false;
      }

      // Duplicate check
      if (files.some((f) => f.name === file.name)) {
        duplicates.push(file.name);
        return false;
      }

      return true;
    });

    if (duplicates.length) {
      toast.error(`Duplicate file(s) skipped: ${duplicates.join(", ")}`);
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setError(null);
  };

  // handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  /** Drag & Drop */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  /** Upload files */
  const handleUpload = async () => {
    if (!files.length) return;

    const formData = new FormData();

    files.forEach((file) =>
      formData.append(
        "files",
        file,
        (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
          file.name,
      ),
    );

    formData.append("userId", userId);

    if (currentFolder) {
      formData.append("parentId", currentFolder);
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },

        onUploadProgress: (e) => {
          if (e.total) {
            setProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });

      setFiles([]);
      onUploadSuccess?.();

      toast.success("Files uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  /** Folder creation */
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error("Please enter folder name");
      return;
    }

    try {
      await axios.post("/api/folders/create", {
        name: folderName.trim(),
        userId,
        parentId: currentFolder,
      });

      toast.success(`Folder "${folderName}" created successfully`);

      setFolderName("");
      setIsModalOpen(false);

      onUploadSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create folder.");
    }
  };

  /** Folder input */
  const folderInputElement = (
    <input
      type="file"
      ref={folderInputRef}
      className="hidden"
      multiple
      {...({
        webkitdirectory: "true",
      } as React.InputHTMLAttributes<HTMLInputElement>)}
      onChange={handleFolderChange}
    />
  );

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          className="group relative overflow-hidden flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-5 py-3 text-sm font-medium text-white/80 transition-all duration-300 hover:bg-white/[0.06] hover:border-indigo-500/30 hover:text-white"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-sky-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <FolderPlus className="relative w-4 h-4 text-indigo-400" />
          <span className="relative">New Folder</span>
        </button>

        <button
          className="group relative overflow-hidden flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-5 py-3 text-sm font-medium text-white/80 transition-all duration-300 hover:bg-white/[0.06] hover:border-indigo-500/30 hover:text-white"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-sky-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <FileUp className="relative w-4 h-4 text-sky-400" />
          <span className="relative">Add Files</span>
        </button>
      </div>

      <button
        className="group relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-5 py-3 text-sm font-medium text-white/80 transition-all duration-300 hover:bg-white/[0.06] hover:border-sky-500/30 hover:text-white"
        onClick={() => folderInputRef.current?.click()}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/0 via-sky-500/10 to-indigo-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <FolderPlus className="relative w-4 h-4 text-sky-400" />
        <span className="relative">Upload Folder</span>
      </button>

      {/* Hidden inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="*/*"
        onChange={handleFileChange}
      />

      {folderInputElement}

      {/* Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative overflow-hidden rounded-3xl border border-dashed transition-all duration-300 ${
          files.length
            ? "border-indigo-500/30 bg-indigo-500/[0.03]"
            : "border-white/10 bg-white/[0.03] hover:border-indigo-500/40 hover:bg-white/[0.05]"
        }`}
      >
        {!files.length ? (
          <div className="relative px-6 py-14 text-center">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-sky-500/5" />

            <div className="relative space-y-5">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <FileUp className="h-10 w-10 text-indigo-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  Drag & drop files here
                </h3>

                <p className="mx-auto max-w-md text-xs leading-relaxed text-white/50">
                  Upload files, videos, images & folders securely with Droply.
                </p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-5 py-2.5 text-sm font-medium text-white transition hover:scale-[1.02]"
              >
                <Upload className="w-4 h-4" />
                Browse Files
              </button>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-white/40">
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                  JPG
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                  PDF
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                  ZIP
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                  DOCX
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                  MP4
                </span>
              </div>

              <p className="text-xs text-white/30">
                Max image size: 5MB • Max video size: 100MB
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Ready to Upload
                </h3>

                <p className="text-xs text-white/40">
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/50">
                {(
                  files.reduce((acc, file) => acc + file.size, 0) /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </div>
            </div>

            {/* Files */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20">
                      <FileUp className="h-5 w-5 text-indigo-300" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {file.name}
                      </p>

                      <p className="text-xs text-white/40">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(index)}
                    className="rounded-lg p-2 text-white/40 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/50">
                  <span>Uploading files...</span>
                  <span>{progress}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.01] hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleUpload}
              disabled={uploading || !!error}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {uploading ? (
                <span className="relative">Uploading... {progress}%</span>
              ) : (
                <>
                  <Upload className="relative h-4 w-4" />
                  <span className="relative">Upload Files</span>
                  <ArrowRight className="relative h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Size Error Modal */}
      <ConfirmationModal
        isOpen={sizeModalOpen}
        onOpenChange={setSizeModalOpen}
        title="File size exceeded"
        description={sizeErrorMessage}
        icon={AlertTriangle}
        iconColor="text-warning"
        confirmText="OK"
        cancelText="warning"
        onConfirm={() => setSizeModalOpen(false)}
      />

      {/* Upload Tips */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-sky-500/5" />

        <div className="relative">
          <h4 className="mb-3 text-sm font-semibold text-white">Upload Tips</h4>

          <ul className="space-y-2 text-xs text-white/60 list-disc pl-5">
            <li>Your uploads remain private and secure</li>
            <li>Supported formats: Images, Videos, PDFs & more</li>
            <li>Faster uploads work best on stable internet</li>
            <li>Organize content using folders for better workflow</li>
          </ul>
        </div>
      </div>

      {/* Folder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/95 backdrop-blur-2xl shadow-2xl shadow-black/40 p-6">
            {/* Header */}
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <FolderPlus className="w-5 h-5 text-indigo-400" />
              New Folder
            </h3>

            {/* Input */}
            <input
              type="text"
              placeholder="My folder"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/40 focus:bg-white/[0.05]"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
              }}
              autoFocus
            />

            {/* Actions */}
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2 text-sm font-medium text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>

              <button
                className="rounded-xl bg-indigo-500/20 text-indigo-300 px-5 py-2 text-sm font-medium transition hover:bg-indigo-500/30 hover:scale-[1.02] disabled:opacity-50"
                onClick={handleCreateFolder}
                disabled={!folderName.trim()}
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
