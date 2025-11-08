import ImageKit from "imagekit";

if (!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
  throw new Error("Missing NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT in environment variables");
}

if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error("Missing ImageKit keys in environment variables");
}

export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export default imagekit;
