/**
 * Next.js Lean Build Configuration
 * Optimized for fast builds and instant deployments
 */

const defaultConfig = require('./next.config');

/**
 * Lean build configuration extends the default config
 * but skips time-consuming checks and optimizations
 */
const leanConfig = {
  ...defaultConfig,

  // Skip type checking for speed
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: 'tsconfig.lean.json',
  },

  // Skip ESLint for speed
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Minimal optimization for speed
  swcMinify: true,
  productionBrowserSourceMaps: false,

  // Skip image optimization for speed
  images: {
    ...defaultConfig.images,
    disableStaticImages: true,
    unoptimized: true,
  },

  // Skip unnecessary checks
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },

  // Bundle optimization still enabled
  experimental: {
    ...defaultConfig.experimental,
    optimizeCss: false, // Skip CSS optimization
    optimizeServerReact: false, // Skip React optimization
    turbotrace: false, // Skip dependency tracing
  },
};

// Check if we're in lean mode
const isLeanMode = process.env.LEAN_MODE === 'true';

module.exports = isLeanMode ? leanConfig : defaultConfig;
