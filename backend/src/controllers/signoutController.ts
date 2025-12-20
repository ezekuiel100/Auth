import type { FastifyReply, FastifyRequest } from "fastify";

export default function signoutController(
  _: FastifyRequest,
  reply: FastifyReply
) {
  reply
    .clearCookie("token", {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
    .status(200)
    .send({ success: true, message: "Signout realizado com sucesso" });
}
