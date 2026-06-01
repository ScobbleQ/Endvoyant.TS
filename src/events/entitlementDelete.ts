import { Events, type Entitlement } from "discord.js";

export default {
  name: Events.EntitlementDelete,
  once: true,
  execute: async (entitlement: Entitlement) => {
    
  },
};
