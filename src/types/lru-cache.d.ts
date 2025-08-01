/**
 * Type declaration for lru-cache
 * Prevents TypeScript compilation errors
 */
declare module 'lru-cache' {
  interface Options<K, V> {
    max?: number;
    maxAge?: number;
    dispose?: (key: K, value: V) => void;
    length?: (value: V, key?: K) => number;
    stale?: boolean;
    maxAge?: number;
    updateAgeOnGet?: boolean;
  }

  class LRUCache<K, V> {
    constructor(options?: Options<K, V>);
    set(key: K, value: V, maxAge?: number): boolean;
    get(key: K): V | undefined;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    reset(): void;
    length: number;
    itemCount: number;
  }

  export = LRUCache;
}
