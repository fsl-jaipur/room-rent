import { PrismaClient } from "@prisma/client";
import type { UserInput } from "../shared/schema";

const prisma = new PrismaClient();

export async function createUserRecord(data: UserInput) {
  return await prisma.users.create({
    data: {
      ...data,
      IsVerified: false,
      IsActive: true,
    }
  });
}

export async function getUserRecord(userId: string) {
  return await prisma.users.findUnique({
    where: { UserId: userId }
  });
}

export async function updateUserRecord(userId: string, data: Partial<UserInput>) {
  return await prisma.users.update({
    where: { UserId: userId },
    data
  });
}
