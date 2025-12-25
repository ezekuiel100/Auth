import { db } from "../database/index.js";

export default async function setUserLockUntil(
  lockUntilDate: string,
  email: string
) {
  try {
    db.prepare(
      "UPDATE users SET lock_until = ?, login_attempts = 0 WHERE email = ?"
    ).run(lockUntilDate, email);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    throw new Error("Failed to update user security status");
  }
}
