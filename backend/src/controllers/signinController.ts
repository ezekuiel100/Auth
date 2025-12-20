import type { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../database/index.js";
import jwt from "jsonwebtoken";
import { signinSchema } from "../schemas/index.js";
import type { Static } from "@fastify/type-provider-typebox";

const secret = process.env.JWT_SECRET_KEY as string;

if (!secret) {
  throw new Error("A variável de ambiente JWT_SECRET_KEY não foi definida!");
}

type SigninBody = Static<typeof signinSchema>;

export default async function signinController(
  request: FastifyRequest<{ Body: SigninBody }>,
  reply: FastifyReply
) {
  try {
    const { email, password } = request.body;

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (user?.password != password) {
      reply
        .status(401)
        .send({ success: false, message: "Credenciais erradas!" });
      return;
    }

    const token = jwt.sign({ id: user.id, email }, secret, {
      expiresIn: "1h",
    });

    const { id, password: _, ...userWithoutPassword } = user;

    reply
      .setCookie("token", token, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600, // 1 hora em segundos
      })
      .send({ success: true, user: userWithoutPassword });
  } catch (error) {
    request.log.error({ error, email: request.body.email });

    reply.code(500).send({
      success: false,
      message: "Erro interno no servidor.",
    });
  }
}
