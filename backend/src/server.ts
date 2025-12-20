import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import signinController from "./controllers/signinController.js";
import middleware from "./middleware.js";
import signupController from "./controllers/signupController.js";
import updateUserController from "./controllers/updateUserController.js";
import signoutController from "./controllers/signoutController.js";
import { signinSchema, signupSchema, updateSchema } from "./schemas/index.js";

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

fastify.register(cors, {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
});
fastify.register(fastifyCookie, { secret });

middleware(fastify);

fastify.get("/", { config: { public: true } }, (request, reply) => {
  reply.send({ hello: "world" });
});

fastify.post("/auth/signin", {
  schema: { body: signinSchema },
  config: { public: true },
  handler: signinController,
});

fastify.post("/auth/signup", {
  schema: { body: signupSchema },
  config: { public: true },
  handler: signupController,
});

fastify.post("/auth/signout", signoutController);

fastify.put(
  "/user/update",
  { schema: { body: updateSchema } },
  updateUserController
);

try {
  await fastify.listen({ port: 3000, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
