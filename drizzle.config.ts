import { defineConfig } from "drizzle-kit";
import { loadEnvFile } from "node:process";
loadEnvFile();

if (!process.env["DATABASE_URL"]) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/drizzle/schema.ts",
  dbCredentials: {
    url: process.env["DATABASE_URL"],
  },
  verbose: true,
  strict: true,
  schemaFilter: ["public"],
});
