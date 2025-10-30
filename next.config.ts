import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable LightningCSS so Tailwind/PostCSS can work normally
  experimental: {
    optimizeCss: false,
  }  
};

export default nextConfig;
