import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { fetchUser } from "../route";
import type { AppContext } from "~/context";
import { SettingsPage } from "~/client/modules/settings/routes/settings";
import { z } from "zod";
import { getOrganizationContext } from "~/server/lib/functions/organization-context";
import { getOrgMembersOptions, getSsoSettingsOptions } from "~/client/api-client/@tanstack/react-query.gen";
import { getOrigin } from "~/client/functions/get-origin";
import { auth } from "~/server/lib/auth";

const getUserInvitations = createServerFn({ method: "GET" }).handler(async () => {
	const request = getRequest();

	return auth.api.listUserInvitations({ headers: request.headers });
});

export const Route = createFileRoute("/(dashboard)/settings/")({
	component: RouteComponent,
	validateSearch: z.object({ tab: z.string().optional() }),
	errorComponent: () => <div>Failed to load settings</div>,
	loader: async ({ context }) => {
		const [authContext, orgContext, userInvitations] = await Promise.all([
			fetchUser(),
			context.queryClient.ensureQueryData({
				queryKey: ["organization-context"],
				queryFn: () => getOrganizationContext(),
			}),
			context.queryClient.ensureQueryData({
				queryKey: ["user-invitations"],
				queryFn: () => getUserInvitations(),
			}),
		]);
		const orgRole = orgContext.activeMember?.role;
		const shouldPrefetchOrgQueries = orgRole === "owner" || orgRole === "admin";

		if (shouldPrefetchOrgQueries) {
			const [org, members, appOrigin] = await Promise.all([
				context.queryClient.ensureQueryData({ ...getSsoSettingsOptions() }),
				context.queryClient.ensureQueryData({ ...getOrgMembersOptions() }),
				context.queryClient.ensureQueryData({ queryKey: ["app-origin"], queryFn: () => getOrigin() }),
			]);

			return {
				authContext: authContext as AppContext,
				userInvitations,
				org,
				members,
				appOrigin,
			};
		}

		return { authContext: authContext as AppContext, userInvitations };
	},
	staticData: {
		breadcrumb: () => [{ label: "Settings" }],
	},
});

function RouteComponent() {
	const { authContext, members, org, appOrigin, userInvitations } = Route.useLoaderData();

	return (
		<SettingsPage
			appContext={authContext}
			initialUserInvitations={userInvitations}
			initialMembers={members}
			initialSsoSettings={org}
			initialOrigin={appOrigin}
		/>
	);
}
