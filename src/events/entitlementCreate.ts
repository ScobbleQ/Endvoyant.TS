import { Events, type Entitlement } from "discord.js";

export default {
  name: Events.EntitlementCreate,
  once: true,
  execute: async (entitlement: Entitlement) => {
    
  },
};
