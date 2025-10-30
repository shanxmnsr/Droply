"use client";
import { IKContext } from "imagekitio-react";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;

if (!urlEndpoint || !publicKey) {
  console.error("Missing ImageKit environment variables");
}

export default function IKProvider({ children }: { children: React.ReactNode }) {
  return (
    <IKContext
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticationEndpoint="/api/imagekit-auth"
    >
      {children}
    </IKContext>
  );
}
