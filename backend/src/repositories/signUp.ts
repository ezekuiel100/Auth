import { db } from "../database/index.js";

const insertUser = db.prepare(`
      INSERT INTO users (name, email, password)
      VALUES (?,?,?)
    `);

export default async function signUp(
  name: string,
  email: string,
  hash: string
) {
  insertUser.run(name, email, hash);
}
