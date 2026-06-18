import pino from "pino";

export const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        level: "debug",
        options: { colorize: true },
      },
      {
        target: "pino-roll",
        level: "info",
        options: {
          file: "./logs/endvoyant",
          frequency: "daily",
          dateFormat: "yyyy-MM-dd",
          mkdir: true,
          limit: { count: 30 },
        },
      },
    ],
  },
});
