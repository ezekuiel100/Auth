import { Type } from "@fastify/type-provider-typebox";

export const signinSchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8, maxLength: 30 }),
});

export const signupSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 30 }),
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8, maxLength: 30 }),
});

export const updateSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 30 }),
  email: Type.String({ format: "email" }),
});
