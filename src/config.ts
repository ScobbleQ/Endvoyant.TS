import { loadEnvFile } from "node:process";
loadEnvFile();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not set`);
  return value;
}

if (!process.env["DISCORD_TOKEN"]) {
  throw new Error("DISCORD_TOKEN is not set");
}

if (!process.env["CLIENT_ID"]) {
  throw new Error("CLIENT_ID is not set");
}

if (!process.env["CLIENT_SECRET"]) {
  throw new Error("CLIENT_SECRET is not set");
}

if (!process.env["DATABASE_URL"]) {
  throw new Error("DATABASE_URL is not set");
}

export const config = {
  discord: {
    token: requireEnv("DISCORD_TOKEN"),
    clientId: requireEnv("CLIENT_ID"),
    clientSecret: requireEnv("CLIENT_SECRET"),
    premiumSkuId: requireEnv("PREMIUM_SKU_ID"),
  },
  database: {
    url: requireEnv("DATABASE_URL"),
  },
  env: process.env["NODE_ENV"] || "development",
} as const;
