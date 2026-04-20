import { MemoryCache, type CacheAdapter } from "./cache/index.js";
import { Language, type Locale } from "./constants/index.js";

/**
 * The Endfield SDK is a library for interacting with the Endfield API.
 * @example
 * const sdk = new EndfieldSDK({
 *   lang: Language.EN_US,
 *   cache: new MemoryCache(),
 * });
 */
export class EndfieldSDK {
  private lang: Locale;
  private cache: CacheAdapter;

  constructor(opt: { lang?: Locale; cache?: CacheAdapter } = {}) {
    this.lang = opt?.lang ?? Language.EN_US;
    this.cache = opt?.cache ?? new MemoryCache();
  }
}
