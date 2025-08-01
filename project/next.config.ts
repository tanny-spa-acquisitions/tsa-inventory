// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

// const isPlayer = process.env.PLAYER === 'true';

// const nextConfig = {
//   reactStrictMode: true,
//   // experimental: {
//   //   appDir: true,
//   // },
//   rewrites: async () => {
//     return isPlayer
//       ? [
//           {
//             source: '/watch/:id*',
//             destination: '/(player)/watch/:id*',
//           },
//         ]
//       : [
//           {
//             source: '/home',
//             destination: '/(app)/home',
//           },
//         ];
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const isPlayer = process.env.PLAYER === "true";

const nextConfig = {
  // reactStrictMode: true,
  reactStrictMode: false,
  basePath: isPlayer ? "" : "",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://tsa-inventory-production.up.railway.app/api/:path*",
          // "http://localhost:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;
