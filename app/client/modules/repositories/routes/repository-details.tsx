import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { getRepositoryOptions } from "~/client/api-client/@tanstack/react-query.gen";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/client/components/ui/tabs";
import { RepositoryInfoTabContent } from "../tabs/info";
import { RepositorySnapshotsTabContent } from "../tabs/snapshots";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { BackupSchedule, Snapshot } from "~/client/lib/types";
import type { GetRepositoryStatsResponse } from "~/client/api-client/types.gen";

export default function RepositoryDetailsPage({
	repositoryId,
	initialSnapshots,
	initialBackupSchedules,
	initialStats,
}: {
	repositoryId: string;
	initialSnapshots?: Snapshot[];
	initialBackupSchedules?: BackupSchedule[];
	initialStats?: GetRepositoryStatsResponse;
}) {
	const navigate = useNavigate();
	const { tab } = useSearch({ from: "/(dashboard)/repositories/$repositoryId/" });
	const activeTab = tab || "info";

	const { data } = useSuspenseQuery({
		...getRepositoryOptions({ path: { shortId: repositoryId } }),
	});

	return (
		<>
			<Tabs value={activeTab} onValueChange={(value) => navigate({ to: ".", search: (s) => ({ ...s, tab: value }) })}>
				<TabsList className="mb-2">
					<TabsTrigger value="info">Configuration</TabsTrigger>
					<TabsTrigger value="snapshots">Snapshots</TabsTrigger>
				</TabsList>
				<TabsContent value="info">
					<RepositoryInfoTabContent repository={data} initialStats={initialStats} />
				</TabsContent>
				<TabsContent value="snapshots">
					<Suspense>
						<RepositorySnapshotsTabContent
							repository={data}
							initialSnapshots={initialSnapshots}
							initialBackupSchedules={initialBackupSchedules}
						/>
					</Suspense>
				</TabsContent>
			</Tabs>
		</>
	);
}
