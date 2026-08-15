import { Hono } from "hono";
import { describe, expect, test, vi } from "vitest";
import { createTestSession } from "~/test/helpers/auth";
import { conditionalRequireAuth } from "../auth.middleware";

const createTestApp = (shouldRequireAuth: boolean, handler: () => void) => {
	const app = new Hono();
	app.get("/protected", conditionalRequireAuth(shouldRequireAuth), (c) => {
		handler();

		return c.text("OK");
	});

	return app;
};

describe("conditionalRequireAuth", () => {
	test("rejects unauthenticated requests when authentication is required", async () => {
		const handler = vi.fn();
		const app = createTestApp(true, handler);

		const response = await app.request("/protected");

		expect(response.status).toBe(401);
		expect(handler).not.toHaveBeenCalled();
	});

	test("runs the handler once for authenticated requests when authentication is required", async () => {
		const session = await createTestSession();
		const handler = vi.fn();
		const app = createTestApp(true, handler);

		const response = await app.request("/protected", { headers: session.headers });

		expect(response.status).toBe(200);
		expect(handler).toHaveBeenCalledOnce();
	});

	test("runs the handler once without authentication when authentication is not required", async () => {
		const handler = vi.fn();
		const app = createTestApp(false, handler);

		const response = await app.request("/protected");

		expect(response.status).toBe(200);
		expect(handler).toHaveBeenCalledOnce();
	});
});
