import { Effect } from "effect";
import { afterEach, describe, expect, test, vi } from "vitest";
import * as nodeModule from "../../../node";
import * as cleanupModule from "../../helpers/cleanup-temporary-keys";
import type { ResticDeps } from "../../types";
import { stats } from "../stats";

const mockDeps: ResticDeps = {
	resolveSecret: async (s) => s,
	getOrganizationResticPassword: async () => "org-restic-password",
	resticCacheDir: "/tmp/restic-cache",
	resticPassFile: "/tmp/restic.pass",
	defaultExcludes: ["/tmp/restic.pass", "/var/lib/zerobyte/repositories"],
	rcloneConfigFile: "/root/.config/rclone/rclone.conf",
};

const config = {
	backend: "local" as const,
	path: "/tmp/restic-repo",
	isExistingRepository: true,
	customPassword: "custom-password",
};

const setup = (stdout: string) => {
	vi.spyOn(cleanupModule, "cleanupTemporaryKeys").mockImplementation(() => Promise.resolve());
	vi.spyOn(nodeModule, "safeExec").mockResolvedValue({
		exitCode: 0,
		stdout,
		stderr: "",
		timedOut: false,
	});
};

afterEach(() => {
	vi.restoreAllMocks();
});

describe("stats command", () => {
	test("parses stats when restic emits progress before JSON", async () => {
		setup('[0:00]   0 / 0 snapshots, 0 B\n{"total_size":0,"snapshots_count":0}\n');

		const result = await Effect.runPromise(stats(config, { organizationId: "org-1" }, mockDeps));

		expect(result).toEqual({
			total_size: 0,
			total_uncompressed_size: 0,
			compression_ratio: 0,
			compression_progress: 0,
			compression_space_saving: 0,
			snapshots_count: 0,
		});
	});
});
