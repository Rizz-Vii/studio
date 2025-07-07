import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep only basic image optimization if you absolutely need it to run
  // Otherwise, remove this entire `images` block too for the absolute minimum.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Do NOT include webpack function, turbopack, transpilePackages, eslint, typescript ignores.
  // We want to test with pure Next.js defaults.
};

export default nextConfig;
