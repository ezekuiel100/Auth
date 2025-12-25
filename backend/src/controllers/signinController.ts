import type { FastifyRequest, FastifyReply } from "fastify";
import { signinSchema } from "../schemas/index.js";
import type { Static } from "@fastify/type-provider-typebox";
import signInService from "../services/signInService.js";
import { AuthError } from "../error.js";

type SigninBody = Static<typeof signinSchema>;

export default async function signInController(
  request: FastifyRequest<{ Body: SigninBody }>,
  reply: FastifyReply
) {
  try {
    const { email, password } = request.body;

    const { user, token } = await signInService(email, password);

    reply
      .setCookie("token", token, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600, // 1 hora em segundos
      })
      .send(user);
  } catch (error) {
    request.log.error({ error, email: request.body.email });

    if (error instanceof AuthError) {
      reply.status(401).send({ message: error.message });
      return;
    }

    reply.code(500).send({ message: "Erro interno no servidor." });
  }
}
