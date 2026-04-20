import { config as loadEnv } from "dotenv";
loadEnv({ debug: false });

if (!process.env.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is not set");
}

if (!process.env.CLIENT_ID) {
  throw new Error("CLIENT_ID is not set");
}

if (!process.env.CLIENT_SECRET) {
  throw new Error("CLIENT_SECRET is not set");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN || "",
    clientId: process.env.CLIENT_ID || "",
    clientSecret: process.env.CLIENT_SECRET || "",
  },
  database: {
    url: process.env.DATABASE_URL || "",
  },
  env: process.env.NODE_ENV || "development",
};
