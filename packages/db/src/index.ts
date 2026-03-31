import { PrismaClient } from "@prisma/client";

import { getRequiredSetting } from "@rent/config";
import type { UsersInput } from "@rent/shared";

let prisma: PrismaClient | null = null;

function getDbClient() {
  const configuredDatabaseUrl = getRequiredSetting("DATABASE_URL");
  process.env.DATABASE_URL = configuredDatabaseUrl;

  if (!prisma) {
    prisma = new PrismaClient();
  }

  return prisma;
}

export type DbClient = PrismaClient;

export function createDb(): DbClient {
  return getDbClient();
}

export async function pingDb() {
  const db = getDbClient();
  return db.$queryRaw`SELECT 1 AS ok`;
}

export async function saveUsers(Users: UsersInput) {
  const db = getDbClient();

  await db.Users.create({
    data: {
      userName: Users.UsersName,
      phone: Users.phone,
      userEmail: Users.UsersEmail,
      aadhaarNumber: Users.aadhaarNumber,
      localAddress: Users.localAddress,
      hometownAddress: Users.hometownAddress,
      profilePhotoUrl: Users.profilePhotoUrl,
      isActive: true
    }
  });
}
