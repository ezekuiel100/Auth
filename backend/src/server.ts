import Fastify from "fastify";
import cors from "@fastify/cors";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "./database/index.js";
import fastifyCookie from "@fastify/cookie";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET_KEY;

if (!secret) {
  throw new Error("A variável de ambiente JWT_SECRET_KEY não foi definida!");
}

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
}).withTypeProvider<TypeBoxTypeProvider>();

fastify.register(cors, { origin: "http://localhost:5173", credentials: true });
fastify.register(fastifyCookie, { secret });

fastify.get("/", (request, reply) => {
  reply.send({ hello: "world" });
});

const signinSchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8, maxLength: 30 }),
});

fastify.post(
  "/auth/signin",
  { schema: { body: signinSchema } },
  (request, reply) => {
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

      const { password: _, ...userWithoutPassword } = user;

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
      fastify.log.error({ error, email: request.body.email });

      reply.code(500).send({
        success: false,
        message: "Erro interno no servidor.",
      });
    }
  }
);

const signupSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 30 }),
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8, maxLength: 30 }),
});

fastify.post(
  "/auth/signup",
  { schema: { body: signupSchema } },
  (request, reply) => {
    const { name, email, password } = request.body;

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password)
      VALUES (?,?,?)
    `);

    insertUser.run(name, email, password);

    reply.send({ success: true });
  }
);

try {
  await fastify.listen({ port: 3000, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
