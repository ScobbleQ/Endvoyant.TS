import { join } from "path";
import { ShardingManager } from "discord.js";
import { config } from "#/config.js";

const manager = new ShardingManager(join(import.meta.dirname, "bot.js"), {
  token: config.discord.token,
});

manager.on("shardCreate", async (shard) => {
  console.log(`Launched shard ${shard.id}`);
});

manager.spawn().catch((error) => {
  console.error(`Failed to spawn shards: ${error}`);
});
