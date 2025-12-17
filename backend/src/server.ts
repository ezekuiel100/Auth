import Fastify from "fastify";
import cors from "@fastify/cors";

const fastify = Fastify();

await fastify.register(cors);

fastify.get("/", (request, reply) => {
  reply.send({ hello: "world" });
});

interface LoginBody {
  email: string;
  password: string;
}

fastify.post<{ Body: LoginBody }>("/auth/signin", (request, reply) => {
  const { email, password } = request.body;

  console.log(email, password);

  reply.send({ success: true });
});

try {
  await fastify.listen({ port: 3000, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
