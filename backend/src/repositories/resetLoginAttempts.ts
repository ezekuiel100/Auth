import { db } from "../database/index.js";

export default async function resetLoginAttempts(email: string) {
  db.prepare(
    "UPDATE users SET login_attempts = 0, lock_until = NULL WHERE email = ?"
  ).run(email);
}
