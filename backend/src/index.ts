import "./env";
import app from "./app";
import { logger } from "./lib/logger";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { connectRedis, disconnectRedis } from "./config/redis";
import { closeQueues } from "./workers/queue";

const rawPort = process.env["PORT"] ?? "4000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  try {
    await connectDatabase();
  } catch (error) {
    logger.error({ error }, "Database connection failed during startup, exiting");
    process.exit(1);
  }

  await connectRedis();

  logger.info({ port }, "Server listening");
});

let shuttingDown = false;

function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, "Gracefully shutting down");

  const forceExitTimer = setTimeout(() => {
    logger.error("Shutdown timed out, forcing exit");
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  server.close(async (closeErr) => {
    if (closeErr) {
      logger.warn({ err: closeErr }, "Error while closing HTTP server");
    }

    try {
      await closeQueues();
    } catch (error) {
      logger.warn({ error }, "Error closing queues");
    }

    try {
      await disconnectRedis();
    } catch (error) {
      logger.warn({ error }, "Error disconnecting Redis");
    }

    try {
      await disconnectDatabase();
    } catch (error) {
      logger.warn({ error }, "Error disconnecting database");
    }

    logger.info("Shutdown complete");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
