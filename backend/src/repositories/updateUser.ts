import { db } from "../database/index.js";

export default async function updateUser(
  name: string,
  email: string,
  userId: number
) {
  const updateUser = db.prepare(
    `UPDATE users 
      SET name = ?, email = ? 
      WHERE id = ? 
      `
  );

  return updateUser.run(name, email, userId);
}
