import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development practices
  reactStrictMode: true,

  // Remove static export - use Firebase SSR instead
  // output: 'export', // REMOVED - conflicts with API routes

  // Disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configure image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
    unoptimized: true, // Required for static export
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Handle Handlebars
    config.resolve.alias.handlebars = "handlebars/dist/handlebars.min.js";

    // Ignore specific Node.js only modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },

  // Experimental features
  experimental: {
    // Configure server actions with proper options
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: ["localhost:3000"],
    },
  },

  // Timeouts and limits
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Configure HTTP compression
  compress: true,
};

export default nextConfig;
