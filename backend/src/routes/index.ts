import type { FastifyInstance } from "fastify/types/instance.js";
import signinController from "../controllers/signinController.js";
import signoutController from "../controllers/signoutController.js";
import updateUserController from "../controllers/updateUserController.js";
import { signinSchema, signupSchema, updateSchema } from "../schemas/index.js";
import { db } from "../database/index.js";
import signUpController from "../controllers/signUpController.js";

export default function routes(fastify: FastifyInstance) {
  fastify.get("/auth/me", (request, reply) => {
    const user = request.user;

    const userData = db
      .prepare("SELECT name, email FROM users WHERE id = ?")
      .get(user.id);

    reply.send(userData);
  });

  fastify.post("/auth/signin", {
    schema: { body: signinSchema },
    config: { public: true },
    handler: signinController,
  });

  fastify.post("/auth/signup", {
    schema: { body: signupSchema },
    config: { public: true },
    handler: signUpController,
  });

  fastify.post("/auth/signout", signoutController);

  fastify.put(
    "/user/update",
    { schema: { body: updateSchema } },
    updateUserController
  );
}
