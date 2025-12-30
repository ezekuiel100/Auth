import { after, describe, it } from "node:test";
import assert from "node:assert";
import { db } from "../src/database/index.js";

const BASE_URL = "http://localhost:3000";

describe("POST /auth/signup", () => {
  after(() => {
    db.prepare("DELETE FROM users WHERE email = ?").run("register@gmail.com");
  });

  it("should signup with success", async () => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "test",
        email: "register@gmail.com",
        password: "12345678",
      }),
    });

    assert.strictEqual(res.status, 201);

    const data = (await res.json()) as { success: boolean };

    assert.strictEqual(data.success, true);
  });
});
