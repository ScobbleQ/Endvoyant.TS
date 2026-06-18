import { loadEnvFile } from "node:process";
loadEnvFile();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not set`);
  return value;
}

export const config = {
  discord: {
    token: requireEnv("DISCORD_TOKEN"),
    clientId: requireEnv("CLIENT_ID"),
    clientSecret: requireEnv("CLIENT_SECRET"),
    premiumSkuId: process.env["PREMIUM_SKU_ID"] || "",
  },
  database: {
    url: requireEnv("DATABASE_URL"),
  },
  env: process.env["NODE_ENV"] || "development",
} as const;
