import type { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../database/index.js";

export default function updateUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user;
  const { name, email } = request.body as { name: string; email: string };

  const updateUser = db.prepare(
    `UPDATE users 
      SET name = ?, email = ? 
      WHERE id = ? 
      `
  );

  const result = updateUser.run(name, email, user.id);

  if (result.changes === 0) {
    return reply.status(404).send({ error: "Usuário não encontrado" });
  }

  reply.send({ message: "Dados atualizados com sucesso" });
}
