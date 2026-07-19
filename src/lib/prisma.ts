import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getClient() {
  const existing = globalForPrisma.prisma;
  const ok =
    existing &&
    typeof (existing as { scheduleEntry?: unknown }).scheduleEntry !== "undefined" &&
    typeof (existing as { scheduleTodo?: unknown }).scheduleTodo !== "undefined";
  if (ok) return existing!;
  const client = createClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getClient();
