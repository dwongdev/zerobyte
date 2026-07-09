import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ListTasksResponse } from "~/client/api-client";
import { getTaskOptions } from "~/client/api-client/@tanstack/react-query.gen";
import { taskEventsOptions, useTaskEvents, type TaskEventsQuery } from "~/client/hooks/use-task-events";
import { activeTaskStatuses } from "~/schemas/tasks";

type TaskResponse = ListTasksResponse[number];

const restoreTasksFilter = (repositoryId: string): TaskEventsQuery => ({
	kind: "restore",
	resourceType: "repository",
	resourceId: repositoryId,
});

const matchesRestore = (task: TaskResponse, snapshotId: string) => {
	return task.kind === "restore" && task.input.kind === "restore" && task.input.snapshotId === snapshotId;
};

const isActive = (task: TaskResponse) => {
	return activeTaskStatuses.some((status) => status === task.status);
};

export const restoreTasksOptions = (repositoryId: string) => {
	return taskEventsOptions(restoreTasksFilter(repositoryId));
};

export const useRestoreTask = (repositoryId: string, snapshotId: string, startedTaskId?: string) => {
	const [streamedFinishedTask, setStreamedFinishedTask] = useState<TaskResponse | null>(null);
	const { data: streamedTasks } = useTaskEvents(restoreTasksFilter(repositoryId), {
		onTaskFinished: (task) => {
			if (matchesRestore(task, snapshotId)) {
				setStreamedFinishedTask(task);
			}
		},
	});

	const streamedActiveTask = streamedTasks?.find((task) => matchesRestore(task, snapshotId)) ?? null;
	const taskFromStream = streamedActiveTask ?? streamedFinishedTask;
	const needsFallback = startedTaskId !== undefined && taskFromStream?.id !== startedTaskId;

	const { data: fallbackTask } = useQuery({
		...getTaskOptions({ path: { taskId: startedTaskId ?? "" } }),
		enabled: needsFallback,
		refetchInterval: ({ state }) => (state.data && !isActive(state.data) ? false : 1000),
	});

	const matchingFallbackTask = fallbackTask && matchesRestore(fallbackTask, snapshotId) ? fallbackTask : null;
	const restoreTask = needsFallback ? matchingFallbackTask : taskFromStream;
	const restoreIsActive = restoreTask ? isActive(restoreTask) : false;

	useEffect(() => {
		if (streamedActiveTask) {
			setStreamedFinishedTask(null);
		}
	}, [streamedActiveTask]);

	const clearFinishedRestoreTask = useCallback(() => {
		setStreamedFinishedTask(null);
	}, []);

	const restoreProgress =
		restoreIsActive && restoreTask?.progress?.kind === "restore" ? restoreTask.progress.progress : null;

	return {
		restoreProgress,
		finishedRestoreTask: restoreIsActive ? null : restoreTask,
		clearFinishedRestoreTask,
		isRestoreRunning: restoreTask ? restoreIsActive : startedTaskId !== undefined,
	};
};
