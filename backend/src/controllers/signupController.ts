import type { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../database/index.js";
import type { signupSchema } from "../schemas/index.js";
import type { Static } from "@fastify/type-provider-typebox";

const insertUser = db.prepare(`
      INSERT INTO users (name, email, password)
      VALUES (?,?,?)
    `);

type SignupBody = Static<typeof signupSchema>;

export default async function signupController(
  request: FastifyRequest<{ Body: SignupBody }>,
  reply: FastifyReply
) {
  const { name, email, password } = request.body;

  try {
    insertUser.run(name, email, password);

    reply.send({ success: true });
  } catch (error: any) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return reply.status(409).send({ error: "E-mail já existe" });
    }
    return reply.status(500).send({ error: "Erro no banco" });
  }
}
