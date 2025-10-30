"use client";

import { useState, useRef } from "react";
import axios from "axios";
import {
  Upload,
  X,
  FileUp,
  AlertTriangle,
  FolderPlus,
  ArrowRight,
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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit");
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    if (currentFolder) formData.append("parentId", currentFolder);

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      await axios.post("/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      alert(`${file.name} uploaded successfully`);
      clearFile();
      onUploadSuccess?.();
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      alert("Please enter a folder name");
      return;
    }

    try {
      await axios.post("/api/folders/create", {
        name: folderName.trim(),
        userId: userId,
        parentId: currentFolder,
      });

      alert(`Folder "${folderName}" created successfully`);
      setFolderName("");
      setIsModalOpen(false);
      onUploadSuccess?.();
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Failed to create folder. Try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          className="flex-1 flex gap-2 items-center px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition"
          onClick={() => setIsModalOpen(true)}
        >
          <FolderPlus className="w-4 h-4" /> New Folder
        </button>
        <button
          className="px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition flex-1 flex items-center gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="w-4 h-4" /> Add Image
        </button>
      </div>

      {/* File drop area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all 
          ${error ? "border-red-500 bg-red-50" : file ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-300"}
        `}
      >
        {!file ? (
          <div>
            <FileUp className="w-12 h-12 mx-auto text-blue-400 mb-3" />
            <p className="text-gray-600">
              Drag & drop your image here, or{" "}
              <span
                className="text-blue-500 cursor-pointer underline"
                onClick={() => fileInputRef.current?.click()}
              >
                browse
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Images up to 5MB</p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileUp className="w-5 h-5 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button onClick={clearFile} className="btn btn-ghost btn-xs text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

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
              ></progress>
            )}

            <button
              className="px-20 py-2 w-full bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition flex-1 flex items-center gap-2"
              onClick={handleUpload}
              disabled={uploading || !!error}
            >
              {uploading ? `Uploading... ${progress}%` : <>Upload Image <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}
      </div>

      {/* Upload tips */}
      <div className="bg-base-200 rounded-lg p-4">
        <h4 className="font-semibold text-sm mb-2">Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Images are private and only visible to you</li>
          <li>• Supported formats: JPG, PNG, GIF, WebP</li>
          <li>• Max file size: 5MB</li>
        </ul>
      </div>

      {/* Folder modal */}
      {isModalOpen && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-blue-500" /> New Folder
            </h3>
            <input
              type="text"
              placeholder="Enter folder name"
              className="input input-bordered w-full mb-4 border px-3 "
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
            <div className="modal-action">
              <button className="px-5 py-2 bg-indigo-100 text-indigo-700 font-bold rounded-lg shadow-sm shadow-indigo-200 hover:bg-indigo-200 transition" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition" onClick={handleCreateFolder}>
                Create
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
