import type { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../database/index.js";

export default function signupController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { name, email, password } = request.body as {
    name: string;
    email: string;
    password: string;
  };

  const insertUser = db.prepare(`
        INSERT INTO users (name, email, password)
        VALUES (?,?,?)
      `);

  insertUser.run(name, email, password);

  reply.send({ success: true });
}
