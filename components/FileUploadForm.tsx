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
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      clearFile();
      onUploadSuccess?.();

      alert(`${file.name} uploaded successfully!`);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      alert("Please enter a valid folder name");
      return;
    }

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
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Failed to create folder. Please try again.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          className="flex w-full justify-center px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition"
          onClick={() => setIsModalOpen(true)}
        >
          <FolderPlus className="w-4 h-4 mx-2 mt-1" /> New Folder
        </button>
        <button
          className="flex w-full justify-center px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="w-4 h-4 mx-2 mt-1" /> Add Image
        </button>
      </div>

      {/* File Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-6 text-center transition-colors duration-300 ${
          error
            ? "border-error bg-error/10"
            : file
              ? "border-primary bg-primary/5"
              : "border-base-300 hover:border-primary/40"
        }`}
      >
        {!file ? (
          <div className="space-y-3">
            <FileUp className="w-12 h-12 mx-auto text-primary/70" />
            <p className="text-base text-gray-600 text-sm">
              Drag & drop your image here, or{" "}
              <span
                className="text-primary font-semibold cursor-pointer hover:underline"
                onClick={() => fileInputRef.current?.click()}
              >
                browse
              </span>
            </p>
            <p className="text-xs text-gray-400">Images up to 5MB</p>
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
              <button onClick={clearFile} className="btn btn-ghost btn-sm">
                <X className="w-4 h-4 text-gray-500" />
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
              className="flex w-full justify-center px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition"
              onClick={handleUpload}
              disabled={uploading || !!error}
            >
              {uploading ? (
                `Uploading... ${progress}%`
              ) : (
                <>
                  <Upload className="w-4 h-4 mx-2" /> Upload Image 
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
          <li>• Maximum file size: 5MB</li>
        </ul>
      </div>

      {/* Folder Modal */}
      {isModalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box border border-base-300 backdrop-blur bg-base-100/90 shadow-xl">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
              <FolderPlus className="w-5 h-5 text-primary" /> New Folder
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Enter a name for your new folder:
            </p>
            <input
              type="text"
              placeholder="My folder"
              className="input border input-bordered w-full mb-4 pl-3"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
            <div className="modal-action">
              <button
                className="px-5 py-2 bg-indigo-200 text-indigo-600 font-bold rounded-lg shadow-md shadow-indigo-100 hover:bg-indigo-300 transition"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-indigo-300 text-indigo-700 font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-400 transition"
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
