import type { FastifyRequest, FastifyReply } from "fastify";
import type { signupSchema } from "../schemas/index.js";
import type { Static } from "@fastify/type-provider-typebox";
import bcrypt from "bcrypt";
import signUp from "../repositories/signUp.js";

const saltRounds = 10;

type SignupBody = Static<typeof signupSchema>;

export default async function signUpController(
  request: FastifyRequest<{ Body: SignupBody }>,
  reply: FastifyReply
) {
  const { name, email, password } = request.body;

  const hash = await bcrypt.hash(password, saltRounds);

  await signUp(name, email, hash);

  reply.status(201).send({ success: true });
}
