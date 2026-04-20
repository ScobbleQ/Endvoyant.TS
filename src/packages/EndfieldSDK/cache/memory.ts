import type { CacheAdapter } from "./index.js";

export class MemoryCache implements CacheAdapter {
  private maxEntries: number;

  constructor(opt: { maxEntries?: number } = {}) {
    this.maxEntries = opt?.maxEntries ?? 1000;
  }
}
