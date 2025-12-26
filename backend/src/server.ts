import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import middleware from "./middleware.js";
import routes from "./routes/index.js";
import rateLimit from "@fastify/rate-limit";
import { AuthError } from "./error.js";

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
  disableRequestLogging: true,
}).withTypeProvider<TypeBoxTypeProvider>();

await fastify.register(rateLimit, { global: true, max: 5, timeWindow: 1000 });

fastify.register(cors, {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
});
fastify.register(fastifyCookie, { secret });

fastify.setErrorHandler((error: FastifyError, request, reply) => {
  const shortStack = error.stack?.split("\n") || [];

  const originLine =
    shortStack.find(
      (line) => line.includes("at ") && !line.includes("node_modules")
    ) || shortStack[1];

  const cleanMessage = error.message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (error instanceof AuthError) {
    request.log.warn(`Tentativa de login falhou: ${error.message}`);
    return reply.status(401).send({ message: error.message });
  }

  request.log.error(`Erro: ${cleanMessage} \n Local: ${originLine?.trim()}`);

  if (error.validation) {
    return reply.status(400).send({
      message: "Dados de entrada inválidos",
      errors: error.validation,
    });
  }

  if ((error as any).code?.startsWith("SQLITE")) {
    return reply.status(500).send({
      message: "Ocorreu um erro interno no servidor.",
    });
  }

  if (error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  reply.status(500).send({
    message: "Ocorreu um erro interno. Tente novamente mais tarde.",
  });
});

middleware(fastify);

fastify.register(routes);

try {
  await fastify.listen({ port: 3000, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
