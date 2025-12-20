import type { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../database/index.js";

export default function updateUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user;
  const { name, email } = request.body as { name: string; email: string };

  try {
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

    reply.send({ success: true, message: "Dados atualizados com sucesso" });
  } catch (error: unknown) {
    if (error instanceof Error && (error as any).code === "SQLITE_CONSTRAINT") {
      return reply.status(400).send({ error: "Este e-mail já está em uso" });
    }

    request.log.error(error);
    return reply.status(500).send({ error: "Erro interno no servidor" });
  }
}
