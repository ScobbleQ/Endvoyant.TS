import { Events, type Entitlement } from "discord.js";
import type { BotEvent } from "#/discord.js";
import { config } from "#/config.ts";
import { UsersDB } from "#/drizzle/index.ts";

export default {
  name: Events.EntitlementCreate,
  execute: async (entitlement: Entitlement) => {
    if (entitlement.skuId !== config.discord.premiumSkuId) return;

    await UsersDB.updateByDcid(entitlement.userId, {
      isPremium: true,
    });
  },
} satisfies BotEvent<Events.EntitlementCreate>;
