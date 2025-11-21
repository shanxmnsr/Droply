"use client";

import { useState, useRef } from "react";
import axios from "axios";
import {
  FileUp,
  X,
  AlertTriangle,
  FolderPlus,
  ArrowRight,
  Upload,
} from "lucide-react";

interface FileUploadFormProps {
  userId: string;
  onUploadSuccess?: () => void;
  currentFolder?: string | null;
}

export default function FileUploadForm({
  userId,
  onUploadSuccess,
  currentFolder = null,
}: FileUploadFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  /** Add files with validation and duplicate check */
  const addFiles = (newFiles: File[]) => {
    const duplicates: string[] = [];

    const validFiles = newFiles.filter((file) => {
      const isVideo = file.type.startsWith("video/");

      // Size validation
      if (!isVideo && file.size > 5 * 1024 * 1024) {
        setError(`Image "${file.name}" exceeds 5MB limit`);
        return false;
      }
      if (isVideo && file.size > 100 * 1024 * 1024) {
        setError(`Video "${file.name}" exceeds 100MB limit`);
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
      alert(`Duplicate file(s) skipped: ${duplicates.join(", ")}`);
    }

    setFiles((prev) => [...validFiles, ...prev]);
    setError(null);
  };

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
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

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
          file.name
      )
    );
    formData.append("userId", userId);
    if (currentFolder) formData.append("parentId", currentFolder);

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      setFiles([]);
      onUploadSuccess?.();
      alert("Files uploaded successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  /** Folder creation */
  const handleCreateFolder = async () => {
    if (!folderName.trim()) return alert("Please enter folder name");

    try {
      await axios.post("/api/folders/create", {
        name: folderName.trim(),
        userId,
        parentId: currentFolder,
      });
      alert(`Folder "${folderName}" created successfully`);
      setFolderName("");
      setIsModalOpen(false);
      onUploadSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Failed to create folder.");
    }
  };

  /** Folder input element using type assertion to allow webkitdirectory */
  const folderInputElement = (
    <input
      type="file"
      ref={folderInputRef}
      className="hidden"
      multiple
      {...({ webkitdirectory: "true" } as React.InputHTMLAttributes<HTMLInputElement>)}
      onChange={handleFolderChange}
    />
  );

  return (
    <div className="space-y-5">
      {/* Buttons */}
      <div className="flex gap-2">
        <button
          className="flex w-full justify-center px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md hover:bg-indigo-400 transition"
          onClick={() => setIsModalOpen(true)}
        >
          <FolderPlus className="w-4 h-4 mx-2 mt-1" /> New Folder
        </button>
        <button
          className="flex w-full justify-center px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md hover:bg-indigo-400 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="w-4 h-4 mx-2 mt-1" /> Add Files
        </button>
      </div>

      <button
        className="flex w-full justify-center px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md hover:bg-indigo-400 transition"
        onClick={() => folderInputRef.current?.click()}
      >
        <FolderPlus className="w-4 h-4 mx-2 mt-1" /> Upload Folder
      </button>

      {/* Hidden inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
      />
      {folderInputElement}

      {/* Drop area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-6 text-center transition-colors duration-300 ${
          error
            ? "border-error bg-error/10"
            : files.length > 0
            ? "border-primary bg-primary/5"
            : "border-base-300 hover:border-primary/40"
        }`}
      >
        {!files.length ? (
          <div className="space-y-3">
            <FileUp className="w-12 h-12 mx-auto text-primary/70" />
            <p className="text-base text-gray-600 text-sm">
              Drag & drop your images or videos here, or{" "}
              <span
                className="text-primary font-semibold cursor-pointer hover:underline"
                onClick={() => fileInputRef.current?.click()}
              >
                browse
              </span>
            </p>
            <p className="text-xs text-gray-400">
              Images up to 5MB, videos up to 100MB
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <FileUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="btn btn-ghost btn-sm"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}

            {error && (
              <div className="alert alert-error flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {uploading && (
              <progress
                className="progress progress-primary w-full"
                value={progress}
                max="100"
              />
            )}

            <button
              className="flex w-full justify-center px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition"
              onClick={handleUpload}
              disabled={uploading || !!error}
            >
              {uploading ? (
                `Uploading... ${progress}%`
              ) : (
                <>
                  <Upload className="w-4 h-4 mx-2" /> Upload Files
                  <ArrowRight className="w-4 h-4 mx-2 mt-1" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Upload Tips */}
      <div className="bg-base-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-2 text-gray-700">Tips</h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Images are private and only visible to you</li>
          <li>• Supported formats: JPG, PNG, GIF, WebP</li>
          <li>• Maximum image size: 5MB, video size: 100MB</li>
        </ul>
      </div>

      {/* Folder Modal */}
      {isModalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box border border-base-300 backdrop-blur bg-base-100/90 shadow-xl">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
              <FolderPlus className="w-5 h-5 text-primary" /> New Folder
            </h3>
            <input
              type="text"
              placeholder="My folder"
              className="input border input-bordered w-full mb-4 pl-3"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
            <div className="modal-action">
              <button
                className="px-5 py-2 bg-indigo-200 text-indigo-600 font-bold rounded-lg shadow-md hover:bg-indigo-300 transition"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md hover:bg-indigo-400 transition"
                onClick={handleCreateFolder}
                disabled={!folderName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
