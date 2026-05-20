// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   experimental: {
//     optimizeCss: false,
//     middlewareClientMaxBodySize: "50mb", // merge both experimental options
//   },
//   images: {
//     domains: ["img.clerk.com"],
//   },
//   api: {
//     bodyParser: {
//       sizeLimit: "50mb", // for legacy API routes
//     },
//   },
// };

// export default nextConfig;



import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: false,
    middlewareClientMaxBodySize: "50mb",
  },

  images: {
    domains: ["img.clerk.com"],
  },
};

export default nextConfig;