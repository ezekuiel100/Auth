import type { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../database/index.js";
import type { signupSchema } from "../schemas/index.js";
import type { Static } from "@fastify/type-provider-typebox";
import bcrypt from "bcrypt";

const insertUser = db.prepare(`
      INSERT INTO users (name, email, password)
      VALUES (?,?,?)
    `);

const saltRounds = 10;

type SignupBody = Static<typeof signupSchema>;

export default async function signupController(
  request: FastifyRequest<{ Body: SignupBody }>,
  reply: FastifyReply
) {
  const { name, email, password } = request.body;

  const hash = await bcrypt.hash(password, saltRounds);

  try {
    insertUser.run(name, email, hash);

    reply.send({ success: true });
  } catch (error: any) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return reply.status(409).send({ error: "E-mail já existe" });
    }

    request.log.error(error);
    return reply.status(500).send({ error: "Erro no banco" });
  }
}
