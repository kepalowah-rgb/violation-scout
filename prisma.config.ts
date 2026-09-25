// Prisma 7 configuration file.
//
// The database connection URL for migrations lives here (it is no longer
// allowed inside schema.prisma). `env()` reads from the environment;
// migrations fail fast with a clear message when DATABASE_URL is missing.

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
