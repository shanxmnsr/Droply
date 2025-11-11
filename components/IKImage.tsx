import Image from "next/image";
import imagekit from "@/lib/imagekit-client";

interface IKImageProps {
  path: string;
  alt?: string;
  width?: number;  
  height?: number;
}

export default function IKImage({ path, alt, width = 300, height = 200 }: IKImageProps) {
  if (!path) return null;

  const imageUrl = imagekit.url({ path });

  return (
    <Image
      src={imageUrl}
      alt={alt || "ImageKit"}
      width={width}
      height={height}
      className="object-cover"
    />
  );
}
