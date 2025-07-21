import type { NextConfig } from "next";
import path from "path";

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

  // External packages for server components (moved from experimental)
  serverExternalPackages: ["firebase-admin", "firebase-functions"],

  // Note: serverActions is now stable in Next.js 15 and enabled by default
  // No explicit configuration needed unless customizing limits

  // Turbopack configuration (used when --turbopack flag is present)
  turbopack: {
    resolveAlias: {
      handlebars: "handlebars/dist/handlebars.min.js",
      "handlebars/runtime": "handlebars/dist/cjs/handlebars.runtime",
      // Node.js modules that need browser polyfills
      buffer: "buffer",
      process: "process/browser",
      path: "path-browserify",
      os: "os-browserify/browser",
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      util: "util",
      url: "url",
      querystring: "querystring-es3",
      http: "stream-http",
      https: "https-browserify",
      // Note: fs, net, tls are automatically excluded in browser builds
    },
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },

  // Webpack configuration for performance optimization (fallback when not using Turbopack)
  webpack: (config, { isServer, dev }) => {
    // Handle Handlebars
    if (config.resolve.alias) {
      config.resolve.alias.handlebars = "handlebars/dist/handlebars.min.js";
    }

    // Ignore specific Node.js only modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Performance optimizations for production (but don't interfere with package optimization)
    if (!dev) {
      // Enable module concatenation for better tree shaking (if not already set)
      if (config.optimization && !config.optimization.concatenateModules) {
        config.optimization.concatenateModules = true;
        config.optimization.usedExports = true;
        config.optimization.sideEffects = false;
      }

      // Only customize splitChunks if Next.js hasn't already optimized it
      if (
        config.optimization &&
        config.optimization.splitChunks &&
        typeof config.optimization.splitChunks !== "string"
      ) {
        config.optimization.splitChunks = {
          ...config.optimization.splitChunks,
          chunks: "all",
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
            },
            ui: {
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              name: "ui",
              chunks: "all",
              enforce: true,
              priority: 20,
            },
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: "radix",
              chunks: "all",
              enforce: true,
              priority: 30,
            },
            charts: {
              test: /[\\/]node_modules[\\/](recharts|framer-motion)[\\/]/,
              name: "charts",
              chunks: "all",
              enforce: true,
              priority: 30,
            },
            common: {
              name: "common",
              minChunks: 2,
              chunks: "all",
              priority: 5,
            },
          },
        };
      }
    }

    // Development optimizations (minimal interference)
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
        poll: false,
        aggregateTimeout: 300,
      };

      // Use Next.js default cache settings unless they don't exist
      if (!config.cache) {
        config.cache = {
          type: "filesystem",
          buildDependencies: {
            config: [__filename],
          },
          cacheDirectory: path.resolve(process.cwd(), ".next/cache"),
          maxMemoryGenerations: 5,
          maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
          name: "dev-cache",
          version: "1.0.0",
        };
      }

      // Optimize resolver for faster module resolution (if not already optimized)
      if (config.resolve.cacheWithContext !== false) {
        config.resolve.cacheWithContext = false;
        config.resolve.unsafeCache = true;
      }
    } else {
      // Production cache settings (minimal)
      if (!config.cache) {
        config.cache = {
          type: "filesystem",
          cacheDirectory: path.resolve(process.cwd(), ".next/cache"),
          maxMemoryGenerations: 1,
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
          name: "prod-cache",
          version: "1.0.0",
        };
      }
    }

    return config;
  },

  // Experimental features for performance
  experimental: {
    // Enable parallel builds for faster compilation
    webpackBuildWorker: true,

    // Filesystem optimizations for Windows
    esmExternals: true,

    // Enable faster file watching and caching
    workerThreads: true,

    // Enable CSS optimization with critters (set to true for Next.js 15)
    optimizeCss: true,

    // Optimize package imports - focus on packages with named exports
    // Note: Radix UI uses namespace imports which may not be optimizable
    optimizePackageImports: [
      "lucide-react", // ✅ Named exports: import { Button } from "lucide-react"
      "framer-motion", // ✅ Named exports: import { motion } from "framer-motion"
      "recharts", // ✅ Named exports: import { BarChart } from "recharts"
    ],

    // Additional performance features
    // Note: serverComponentsExternalPackages moved to root level as serverExternalPackages
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,

    // Enable SWC minification for better performance
    styledComponents: true,
  },

  // Performance optimizations
  poweredByHeader: false,
  generateEtags: false,

  // Note: swcMinify is enabled by default in Next.js 15, no need to specify

  // Timeouts and limits for optimized filesystem performance
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer (extended for Windows optimization)
    maxInactiveAge: 1000 * 60 * 10, // 10 minutes to reduce filesystem operations
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
