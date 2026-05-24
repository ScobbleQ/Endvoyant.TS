import { join } from "path";
import { ShardingManager } from "discord.js";
import { config } from "#/config.ts";

const manager = new ShardingManager(join(import.meta.dirname, "bot.ts"), {
  token: config.discord.token,
});

manager.on("shardCreate", async (shard) => {
  console.log(`Launched shard ${shard.id}`);
});

manager.spawn().catch((error) => {
  console.error(`Failed to spawn shards: ${error}`);
});

process.on("SIGINT", async () => {
  await manager.broadcastEval((client) => client.destroy());
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await manager.broadcastEval((client) => client.destroy());
  process.exit(0);
});
