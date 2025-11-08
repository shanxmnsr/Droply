import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  experimental: {
    optimizeCss: false,
  },
  images: {
    domains: ["img.clerk.com"], 
  },
};

export default nextConfig;
