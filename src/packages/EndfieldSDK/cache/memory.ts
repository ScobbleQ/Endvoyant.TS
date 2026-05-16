import type { CacheAdapter } from "./index.ts";

export class MemoryCache implements CacheAdapter {
  private maxEntries: number;

  constructor(opt: { maxEntries?: number } = {}) {
    this.maxEntries = opt?.maxEntries ?? 1000;
  }
}
