import { Agent, type Dispatcher } from "undici";
import { type Locale } from "../types/language.ts";
import { toWebLocale } from "../utils/convert.ts";
import { computeSign } from "../utils/signing.ts";

export interface ClientOptions {
  defaultLang?: Locale;
}

const agent = new Agent({
  connect: { timeout: 5_000 },
  keepAliveTimeout: 30_000,
  keepAliveMaxTimeout: 60_000,
});

export class BaseClient {
  readonly defaultLang: Locale;

  constructor(options: ClientOptions = {}) {
    this.defaultLang = options.defaultLang ?? "en-us";
  }

  async request(options: Dispatcher.RequestOptions): Promise<Dispatcher.ResponseData> {
    return agent.request(options);
  }

  skportHeaders(token: string, path: string, body: string, lang?: Locale) {
    const ts = Math.floor(Date.now() / 1000).toString();
    return {
      platform: "3",
      "sk-language": toWebLocale(lang ?? this.defaultLang),
      vName: "1.0.0",
      timestamp: ts,
      sign: computeSign({ token, path, body, timestamp: ts }),
    };
  }
}
