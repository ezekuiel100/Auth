import type { FastifyInstance } from "fastify/types/instance.js";
import signinController from "../controllers/signinController.js";
import signoutController from "../controllers/signoutController.js";
import signupController from "../controllers/signupController.js";
import updateUserController from "../controllers/updateUserController.js";
import { signinSchema, signupSchema, updateSchema } from "../schemas/index.js";

export default function routes(fastify: FastifyInstance) {
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
}
