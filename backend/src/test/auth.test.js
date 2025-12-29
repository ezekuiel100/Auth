import assert from "node:assert";
import { describe, it } from "node:test";

const BASE_URL = "http://localhost:3000";

describe("POST /auth/signin", () => {
    it("should signin with success", async () => {
        const res = await fetch(`${BASE_URL}/auth/signin`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: "test@email.com",
                password: "12345678",
            }),
        });

        assert.strictEqual(res.status, 200, "Response status should be 200 OK");
        assert.match(
            res.headers.get("content-type"),
            /application\/json/,
            "Response should be in JSON format"
        );
        const setCookie = res.headers.get("set-cookie");

        assert.ok(setCookie, "The server should have sent a cookie");
        assert.match(
            setCookie,
            /HttpOnly/i,
            "Cookie must be HttpOnly for security"
        );

        const data = await res.json();
        assert.deepStrictEqual(
            data,
            { name: "test", email: "test@email.com" },
            "Response body does not match expected user data"
        );
    });

    it("should return 401 for invalid password", async () => {
        const res = await fetch(`${BASE_URL}/auth/signin`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: "test@email.com",
                password: "1234xxxx",
            }),
        });

        assert.strictEqual(res.status, 401, "Response status should be 401");
        assert.match(
            res.headers.get("content-type"),
            /application\/json/,
            "Response should be in JSON format"
        );

        const setCookie = res.headers.get("set-cookie");
        assert.strictEqual(
            setCookie,
            null,
            "Should not send a cookie on failed login"
        );

        const data = await res.json();

        assert.deepStrictEqual(data, { message: "Credenciais inválidas" });
    });
});
