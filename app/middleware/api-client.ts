import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import {
	createRequestClient,
	runWithRequestClient,
} from "~/lib/request-client";
import { config } from "../server/core/config";

export const apiClientMiddleware = createMiddleware().server(async ({ next }) => {
	const client = createRequestClient({
		baseUrl: `http://127.0.0.1:${config.port}`,
		headers: {
			cookie: getRequestHeaders().get("cookie") ?? "",
		},
	});

	return runWithRequestClient(client, () => next());
});
