import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development practices
  reactStrictMode: true,

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
        crypto: false, // Add other Node.js built-ins that might be used
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
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // Configure HTTP compression
  compress: true,

  // Add custom headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
