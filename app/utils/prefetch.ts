import type { FetchQueryOptions, QueryClient, QueryKey } from "@tanstack/react-query";

export async function prefetchOrSkip<
	TQueryFnData = unknown,
	TError = Error,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
>(
	queryClient: QueryClient,
	options: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
	timeoutMs = 150,
): Promise<void> {
	await Promise.race([
		queryClient.prefetchQuery(options),
		new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
	]);
}
