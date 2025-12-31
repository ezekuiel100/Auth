import type { FastifyRequest, FastifyReply } from "fastify";
import updateUser from "../repositories/updateUser.js";

export default async function updateUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user;
  const { name, email } = request.body as { name: string; email: string };

  const result = await updateUser(name, email, user.id);

  if (result.changes === 0) {
    return reply.status(404).send({ error: "Usuário não encontrado" });
  }

  reply.send({ message: "Dados atualizados com sucesso" });
}
