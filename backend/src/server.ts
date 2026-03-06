import { buildApp } from "./app";
import { env } from "./config/env";
import { connectRedis } from "./config/redis";
import { prisma } from "./config/db";
import { startWsServer } from "./ws/wsServer";

async function main() {
  await connectRedis();

  // Start WebSocket server on port 8080 (matches reference repo)
  startWsServer(8080);

  const app = await buildApp();

  try {
    await app.listen({ port: Number(env.PORT), host: "0.0.0.0" });
    console.log(`Server running on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }

  const shutdown = async () => {
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main();
