import { db } from "../database/index.js";

export interface UserEntity {
  id: number;
  name: string;
  email: string;
  password: string;
  login_attempts: number;
  lock_until: string | null;
}

export default async function getUserByEmail(
  email: string
): Promise<UserEntity | undefined> {
  try {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Could not fetch user from database");
  }
}
