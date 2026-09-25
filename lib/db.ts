// Prisma client singleton.
//
// Prisma 7 requires a driver adapter for direct database connections.
// The pool is created lazily — no connection is opened until the first
// query, so importing this module at build time is safe. A placeholder URL
// is used when DATABASE_URL is unset (e.g. during `next build`); any real
// query without a configured database will fail with a clear pg error.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL ?? "postgresql://localhost:5432/unconfigured";
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
