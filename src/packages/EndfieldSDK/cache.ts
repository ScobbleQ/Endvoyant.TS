type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export class Cache<T> {
  readonly ttlMs: number;
  private readonly entries = new Map<string, CacheEntry<T>>();

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs;
  }

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    if (Date.now() >= entry.expiresAt) {
      this.entries.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T): T {
    this.entries.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
    return value;
  }

  getOrSet(key: string, factory: () => T): T {
    const cached = this.get(key);
    console.log(`Cache getOrSet for key: ${key}`);
    if (cached !== undefined) {
      console.log("cache hit");
      return cached;
    }
    console.log("cache miss");
    return this.set(key, factory());
  }

  delete(key: string) {
    return this.entries.delete(key);
  }

  clear() {
    this.entries.clear();
  }
}
