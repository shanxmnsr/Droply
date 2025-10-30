
"use client";
import { IKImage } from "imagekitio-react";

export default function MyIKImage({ path }: { path: string }) {
  return <IKImage path={path} alt="image" />;
}
