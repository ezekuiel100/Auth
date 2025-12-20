import type { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import "fastify";

declare module "fastify" {
  interface FastifyContextConfig {
    public?: boolean;
  }

  interface FastifyRequest {
    user?: any;
  }
}

const secret = process.env.JWT_SECRET_KEY as string;

if (!secret) {
  throw new Error("A variável de ambiente JWT_SECRET_KEY não foi definida!");
}

export default function middleware(fastify: FastifyInstance) {
  fastify.addHook("preHandler", (request, reply, done) => {
    const isPublic = request.routeOptions.config?.public;

    if (isPublic) {
      return done();
    }

    const { token } = request.cookies;

    if (!token) {
      reply.code(401).send({ error: "Token missing" });
      return;
    }

    try {
      const decode = jwt.verify(token, secret);
      request.user = decode;
      done();
    } catch (err) {
      reply.code(401).send({ error: "Invalid token" });
    }
  });
}
