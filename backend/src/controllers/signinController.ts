import type { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../database/index.js";
import jwt from "jsonwebtoken";
import { signinSchema } from "../schemas/index.js";
import type { Static } from "@fastify/type-provider-typebox";
import incrementFailedLoginAttempts from "../repositories/incrementFailedLoginAttempts.js";
import bcrypt from "bcrypt";

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

    if (!user) {
      reply
        .status(401)
        .send({ success: false, message: "Credenciais erradas!" });
      return;
    }

    const isLocked = user.lock_until && new Date(user.lock_until) > new Date();

    if (isLocked) {
      return reply.status(423).send({
        success: false,
        message: "Usuário temporariamente bloqueado",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const { login_attempts } = incrementFailedLoginAttempts(email);

      if (
        login_attempts >= 5 &&
        (!user.lock_until || new Date(user.lock_until) < new Date())
      ) {
        const lockUntilDate = new Date(
          Date.now() + 15 * 60 * 1000
        ).toISOString();

        db.prepare(
          "UPDATE users SET lock_until = ?, login_attempts = 0 WHERE email = ?"
        ).run(lockUntilDate, email);

        return reply.status(423).send({
          success: false,
          message: "Usuário temporariamente bloqueado",
        });
      }

      reply
        .status(401)
        .send({ success: false, message: "Credenciais erradas!" });
      return;
    }

    db.prepare(
      "UPDATE users SET login_attempts = 0, lock_until = NULL WHERE email = ?"
    ).run(email);

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
