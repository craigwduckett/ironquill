import pino from "pino";

const level = process.env.NODE_ENV === "production" ? "warn" : "info";

export const logger =
  process.env.NODE_ENV !== "production"
    ? pino({
        level,
        transport: { target: "pino-pretty", options: { colorize: true } },
      })
    : pino({ level });
