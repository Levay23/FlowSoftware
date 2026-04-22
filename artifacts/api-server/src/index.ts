import app from "./app";
import { logger } from "./lib/logger";
import { cleanupExpiredDemoUsers, startDemoCleanupJob } from "./middlewares/auth";
import { seedAdminUser } from "./services/seed";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  await seedAdminUser();

  cleanupExpiredDemoUsers().catch((err) => {
    logger.warn({ err }, "Could not clean expired demo users on startup");
  });

  startDemoCleanupJob();

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

start().catch((err) => {
  logger.error({ err }, "Fatal error during startup");
  process.exit(1);
});
