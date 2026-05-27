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



// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   experimental: {
//     optimizeCss: false,
//     middlewareClientMaxBodySize: "50mb",
//   },

//   images: {
//     domains: ["img.clerk.com"],
//   },
// };

// export default nextConfig;













// this code is working 
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   experimental: {
//     optimizeCss: false,
//     middlewareClientMaxBodySize: "50mb",
//   },

//   images: {
//     domains: [
//       "img.clerk.com",
//       "ik.imagekit.io",
//     ],
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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
};

export default nextConfig;