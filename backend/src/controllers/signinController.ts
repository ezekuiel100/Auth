import type { FastifyRequest, FastifyReply } from "fastify";
import { signinSchema } from "../schemas/index.js";
import type { Static } from "@fastify/type-provider-typebox";
import signInService from "../services/signInService.js";

type SigninBody = Static<typeof signinSchema>;

export default async function signInController(
  request: FastifyRequest<{ Body: SigninBody }>,
  reply: FastifyReply
) {
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
}
