import Fastify from "fastify";
import cors from "@fastify/cors";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { db } from "./database/index.js";

const fastify = Fastify().withTypeProvider<TypeBoxTypeProvider>();

await fastify.register(cors);

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
    const { email, password } = request.body;

    const user = db
      .prepare("SELECT name, email FROM users WHERE email = ?")
      .get(email);

    console.log(user);

    reply.send({ success: true, user });
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
