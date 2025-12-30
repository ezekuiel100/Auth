import { before, describe, it } from "node:test";
import assert from "node:assert";
import { fastify } from "../src/server.js";

describe("POST /auth/signout", () => {
  let cookieHeader = "";

  before(async () => {
    const res = await fastify.inject({
      method: "POST",
      url: `/auth/signin`,
      headers: {
        "Content-Type": "application/json",
      },
      payload: {
        email: "test@email.com",
        password: "12345678",
      },
    });

    const setCookie = res.headers["set-cookie"];
    cookieHeader = cookieHeader = Array.isArray(setCookie)
      ? setCookie.join("; ")
      : setCookie || "";
  });

  it("should signout with success", async () => {
    const res = await fastify.inject({
      method: "POST",
      url: "/auth/signout",
      headers: {
        cookie: cookieHeader, // Envia o cookie que você acabou de ganhar no login
      },
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json().success, true);

    const cookie = res.cookies[0] as {
      name: string;
      value: string;
      maxAge: number;
      path: string;
      expires: Date;
      httpOnly: boolean;
      sameSite: string;
    };

    assert.strictEqual(cookie.value, "");
    assert.strictEqual(cookie.maxAge, 0);
    assert.strictEqual(cookie.httpOnly, true);
    assert.strictEqual(cookie.expires.getUTCFullYear(), 1970);
  });
});
