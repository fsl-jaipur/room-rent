import { saveUser } from "@rent/db";
import type { UserInput } from "@rent/shared";

export async function createUserRecord(user: UserInput) {
  await saveUser(user);
}