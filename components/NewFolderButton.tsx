"use client";

import { useState } from "react";
import axios from "axios";
import { FolderPlus, Check, X } from "lucide-react";
import toast from "react-hot-toast";

interface NewFolderButtonProps {
  userId: string;
  onFolderCreated?: () => void;
}

export default function NewFolderButton({
  userId,
  onFolderCreated,
}: NewFolderButtonProps) {
  const [folderName, setFolderName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleCreate = async () => {
    if (!folderName.trim()) {
      toast.error("Folder name is required");
      return;
    }

    setCreating(true);

    try {
      await axios.post("/api/folders", {
        name: folderName.trim(),
        userId,
      });

      toast.success(`Folder "${folderName}" created`);

      setFolderName("");
      setShowInput(false);
      onFolderCreated?.();
    } catch {
      toast.error("Failed to create folder");
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    setShowInput(false);
    setFolderName("");
  };

  return (
    <div className="w-full">
      {!showInput ? (
        // Trigger Button
        <button
          type="button"
          onClick={() => setShowInput(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-zinc-200 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition active:scale-95 backdrop-blur-md"
        >
          <FolderPlus className="h-4 w-4 text-indigo-400" />
          New Folder
        </button>
      ) : (
        // Input Row (FULL WIDTH FIX)
        <div className="flex w-full items-center gap-2 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 focus-within:border-indigo-500/30 transition">
          {/* Icon */}
          <FolderPlus className="h-4 w-4 text-indigo-400 shrink-0" />

          {/* Input */}
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Enter folder name..."
            className="flex-1 min-w-0 bg-transparent outline-none text-sm text-zinc-200 placeholder:text-zinc-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") handleCancel();
            }}
          />

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition active:scale-95 disabled:opacity-50"
              title="Create"
            >
              <Check className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition active:scale-95"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Loading text */}
          {creating && (
            <span className="ml-2 text-xs text-zinc-400 animate-pulse">
              creating...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
