import "reflect-metadata";
import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const server = app.listen(env.port, () => {
  console.log(`ClientCore API listening on http://localhost:${env.port}`);
});

process.on("SIGTERM", () => {
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0));
  });
});
