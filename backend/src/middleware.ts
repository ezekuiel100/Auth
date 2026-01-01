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

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("A variável de ambiente SECRET_KEY não foi definida!");
}

export default async function middleware(fastify: FastifyInstance) {
  fastify.addHook("preHandler", (request, reply, done) => {
    const isPublic = request.routeOptions.config?.public;

    if (isPublic) {
      return done();
    }

    const { accessToken, refreshToken } = request.cookies;

    if (!accessToken && !refreshToken) {
      return reply.code(401).send({ error: "Tokens missing" });
    }

    try {
      const decode = jwt.verify(accessToken ?? "", ACCESS_SECRET);

      request.user = decode;
      done();
    } catch (err: any) {
      if (err.name === "TokenExpiredError" && refreshToken) {
        try {
          const refreshDecoded = jwt.verify(refreshToken, REFRESH_SECRET) as {
            id: number;
            email: string;
          };

          const newAccessToken = jwt.sign(
            { id: refreshDecoded.id },
            ACCESS_SECRET,
            {
              expiresIn: "15m",
            }
          );

          reply.setCookie("accessToken", newAccessToken, {
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 3600,
          });

          request.user = refreshDecoded;
          return done();
        } catch (refreshErr) {
          return reply.code(401).send({ error: "Session expired" });
        }
      }

      reply.code(401).send({ error: "Invalid token" });
    }
  });
}
