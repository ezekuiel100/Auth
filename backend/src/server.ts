import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import middleware from "./middleware.js";
import routes from "./routes/index.js";
import rateLimit from "@fastify/rate-limit";

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
  const shortStack = error.stack?.split("\n")[1]?.trim();

  const cleanMessage = error.message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  request.log.error(`Erro: ${cleanMessage} \n Local: ${shortStack}`);

  if (error.validation) {
    return reply.status(400).send({
      message: "Dados de entrada inválidos",
      errors: error.validation,
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
