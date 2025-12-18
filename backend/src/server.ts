import Fastify from "fastify";
import cors from "@fastify/cors";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";

const fastify = Fastify().withTypeProvider<TypeBoxTypeProvider>();

await fastify.register(cors);

fastify.get("/", (request, reply) => {
  reply.send({ hello: "world" });
});

const loginSchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8, maxLength: 30 }),
});

fastify.post(
  "/auth/signin",
  { schema: { body: loginSchema } },
  (request, reply) => {
    const { email, password } = request.body;

    console.log(email, password);

    reply.send({ success: true });
  }
);

try {
  await fastify.listen({ port: 3000, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
