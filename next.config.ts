import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "expert-bat-486.convex.cloud",
        port: "",
      },
    ],
  },
};
export default nextConfig;
