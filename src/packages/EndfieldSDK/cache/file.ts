import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { CacheAdapter } from "./index.js";

export class FileCache implements CacheAdapter {
  private path: string;
  private maxEntries: number;

  constructor(opt: { path?: string; maxEntries?: number } = {}) {
    this.path = opt?.path ?? join(process.cwd(), ".cache");
    this.maxEntries = opt?.maxEntries ?? 1000;

    mkdirSync(this.path, { recursive: true });
  }
}
