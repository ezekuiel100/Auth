import { db } from "../database/index.js";

export default async function incrementFailedLoginAttempts(
  email: string
): Promise<{ login_attempts: number }> {
  const stmt = db.prepare(
    "UPDATE users SET login_attempts = login_attempts + 1 WHERE email = ? RETURNING login_attempts"
  );

  return stmt.get(email);
}
