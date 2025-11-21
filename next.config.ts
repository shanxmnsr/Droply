import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: false,
  },
  images: {
    domains: ["img.clerk.com"],
  },
  api: {
    bodyParser: {
      sizeLimit: "50mb", // ✅ for legacy API routes
    },
  },
  experimental: {
    middlewareClientMaxBodySize: "50mb", // ✅ for App Router API routes
  },
};

export default nextConfig;
