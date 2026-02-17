import type { Page } from "@playwright/test";

export const waitForAppReady = async (page: Page) => {
	await page.waitForFunction(() => document.body?.getAttribute("data-app-ready") === "true");
};

export const gotoAndWaitForAppReady = async (page: Page, url: string) => {
	await page.goto(url, { waitUntil: "domcontentloaded" });
	await waitForAppReady(page);
};
