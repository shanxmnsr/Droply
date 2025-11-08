
import imagekit from "@/lib/imagekit-client"; 

interface IKImageProps {
  path: string;
  alt?: string;
}

export default function IKImage({ path, alt }: IKImageProps) {
  if (!path) return null;

  const imageUrl = imagekit.url({ path });

  return <img src={imageUrl} alt={alt || "ImageKit"} />;
}
