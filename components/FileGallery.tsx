import { IKImage } from "imagekitio-react";
import type { File as FileType } from "@/lib/db/schema";
import { getIKPath } from "@/lib/imagekit";

interface FileGalleryProps {
  files: FileType[];
}

export default function FileGallery({ files }: FileGalleryProps) {
  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {files.map((file) => {
        const filePath = file.type?.startsWith("video/") ? file.thumbnailUrl : file.path;
        const normalizedPath = getIKPath(filePath);

        return (
          <div
            key={file.id}
            className="flex flex-col items-center space-y-2 border border-gray-200 rounded-md p-2 w-[200px]"
          >
            {normalizedPath ? (
              <IKImage
                urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? ""}
                path={normalizedPath}
                alt={file.name}
                width={200}
                height={200}
                className="rounded-md object-cover w-[200px] h-[200px]"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center w-[200px] h-[200px] bg-gray-100 rounded-md text-gray-400 text-sm">
                No preview
              </div>
            )}
            <p className="text-sm text-gray-700 truncate w-[180px] text-center">
              {file.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}
