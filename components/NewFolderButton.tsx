"use client";

import { useState } from "react";
import axios from "axios";
import { FolderPlus } from "lucide-react";

interface NewFolderButtonProps {
  userId: string;
  onFolderCreated?: () => void;
}

export default function NewFolderButton({ userId, onFolderCreated }: NewFolderButtonProps) {
  const [folderName, setFolderName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleCreate = async () => {
    if (!folderName.trim()) return;
    setCreating(true);
    try {
      await axios.post("/api/folders", { name: folderName, userId });
      setFolderName("");
      setShowInput(false);
      onFolderCreated?.();
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Failed to create folder");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 border rounded text-primary border-primary hover:bg-primary/10"
        >
          <FolderPlus className="h-4 w-4" /> New Folder
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Folder name"
            className="border rounded px-2 py-1 flex-1 text-sm"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="bg-primary text-white px-3 py-1 rounded text-sm"
          >
            {creating ? "Creating..." : "Create"}
          </button>
          <button
            onClick={() => setShowInput(false)}
            className="text-gray-500 border rounded px-2 py-1 text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
