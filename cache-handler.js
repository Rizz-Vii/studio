const { IncrementalCache } = require("next/dist/server/lib/incremental-cache");

class CustomIncrementalCache extends IncrementalCache {
  constructor(options) {
    super(options);

    // Configure cache for better performance on Windows
    this.cacheDirectory = options.dev ? "./.next/cache" : "./.next/cache";
    this.maxMemoryCacheSize = 50 * 1024 * 1024; // 50MB
    this.maxFileSystemCacheSize = 500 * 1024 * 1024; // 500MB
  }

  async get(key, ctx) {
    try {
      return await super.get(key, ctx);
    } catch (error) {
      console.warn("Cache get error:", error.message);
      return null;
    }
  }

  async set(key, data, ctx) {
    try {
      return await super.set(key, data, ctx);
    } catch (error) {
      console.warn("Cache set error:", error.message);
      return;
    }
  }
}

module.exports = CustomIncrementalCache;
