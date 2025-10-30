// Display multiple images in a grid.

"use client";

import React from "react";
import IKImage from "./IKImage";

interface File {
  id: string;
  path: string; // ImageKit path stored in database
  name: string;
}

interface FileGalleryProps {
  files: File[];
}

const FileGallery: React.FC<FileGalleryProps> = ({ files }) => {
  if (!files.length) {
    return <p>No files uploaded yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {files.map((file) => (
        <div key={file.id} className="border rounded p-2 bg-white shadow">
          <IKImage path={file.path} transformation={{ width: 200, height: 200 }} />
          <p className="mt-2 text-sm text-center truncate">{file.name}</p>
        </div>
      ))}
    </div>
  );
};

export default FileGallery;
