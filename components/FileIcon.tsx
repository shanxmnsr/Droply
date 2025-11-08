import { IKImage } from "imagekitio-react";
import type { File as FileType } from "@/lib/db/schema";
import { getIKPath } from "@/lib/imagekit";

interface FileIconProps {
  file: FileType;
}

export default function FileIcon({ file }: FileIconProps) {
  const normalizedPath = getIKPath(file.path);

  return (
    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
      {normalizedPath ? (
        <IKImage
          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
          path={normalizedPath}
          alt={file.name}
          width={48}
          height={48}
          className="object-cover w-full h-full"
          loading="lazy"
        />
      ) : (
        <span className="text-gray-400 text-xs">No preview</span>
      )}
    </div>
  );
}
