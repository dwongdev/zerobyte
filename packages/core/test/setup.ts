import { vi } from "vitest";

vi.mock(import("../src/node/logger.ts"), () => ({
	logger: {
		debug: () => {},
		info: () => {},
		warn: () => {},
		error: () => {},
	},
}));
