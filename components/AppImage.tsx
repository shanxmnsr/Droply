import Image, { ImageProps } from "next/image";

export default function AppImage({ alt, ...props }: ImageProps) {
  return <Image {...props} alt={alt || ""} unoptimized />;
}
