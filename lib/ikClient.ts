
import ImageKit from "imagekit-javascript";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

if (!urlEndpoint || !publicKey) {
  console.warn("Missing ImageKit environment variables in .env.local (frontend)");
} else {
  console.log("ImageKit frontend vars:", { urlEndpoint, publicKey });
}

const ikClient = new ImageKit({
  publicKey,
  urlEndpoint,
  authenticationEndpoint: "/api/imagekit-auth",
});

export default ikClient;
