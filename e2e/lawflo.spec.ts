import { expect, test, type Page } from "@playwright/test";

async function publishPreparedEpisode(page: Page) {
  await page.getByRole("button", { name: "Enter LAWFLO" }).click();
  await page.getByRole("button", { name: /legal engineer/i }).click();
  await page.getByRole("button", { name: "Use prepared source pack" }).click();
  await expect(page.getByText(/5 sources ready/i)).toBeVisible();
  await page.getByRole("button", { name: "Create episode" }).click();
  await expect(page.getByRole("heading", { name: /creating your learning episode/i })).toBeVisible();
  await page.getByRole("button", { name: "Approve and publish" }).waitFor({ timeout: 15_000 });
  await page.getByRole("button", { name: "Approve and publish" }).click();
  await page.getByRole("button", { name: "View as learner" }).click();
  await expect(page.getByText("Ready to learn the workflow")).toBeVisible();
}

async function completeEpisode(page: Page) {
  await page.getByRole("button", { name: "Watch episode" }).click();

  const endedPreparedSegment = () => page.evaluate(() => {
    const video = document.querySelector<HTMLVideoElement>('video[title="Prepared training episode"]');
    if (!video) return false;
    video.dispatchEvent(new Event("ended"));
    return true;
  });
  if (!(await endedPreparedSegment())) {
    await page.getByRole("button", { name: /chapter 6/i }).click();
  }

  await page.getByRole("button", { name: "Send to business approval" }).click();
  await expect(page.getByRole("alert")).toContainText("Low value never cancels a material redline");
  await page.getByRole("button", { name: "Escalate to legal review" }).click();

  if (!(await endedPreparedSegment())) {
    await page.getByRole("button", { name: "Continue to rehearsal" }).click();
  }

  await page.getByRole("button", { name: "Start guided rehearsal" }).click();
}

async function completeGuidedRehearsal(page: Page) {
  await page.getByRole("button", { name: "Open Northstar matter" }).click();
  await page.getByRole("button", { name: "Run AI review" }).click();
  await page.getByRole("button", { name: "Open Material standard-term change" }).click();
  await page.getByRole("button", { name: "Compare liability clause" }).click();
  await page.getByRole("textbox", { name: "Verified value for Material standard-term change" }).fill("true");
  await page.getByRole("button", { name: "Submit verified value for Material standard-term change" }).click();
  await page.getByRole("button", { name: /open material standard-term changes require legal review/i }).click();
  await page.getByRole("button", { name: "Choose Legal review" }).click();
  await page.getByRole("textbox", { name: "Explain your route" }).fill(
    "The liability cap was removed, so the material-redline rule requires legal review.",
  );
  await page.getByRole("button", { name: "Submit route" }).click();
  await page.getByRole("button", { name: "Inspect audit trail" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("canonical three-minute demo travels from legal engineer sources to learner review", async ({ page }) => {
  const startedAt = Date.now();
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await publishPreparedEpisode(page);
  await expect(page.getByRole("navigation", { name: "Learning journey" }).getByRole("button")).toHaveText(["Episode"]);
  await completeEpisode(page);
  await expect(page.getByRole("heading", { level: 1, name: /northstar analytics sales renewal/i })).toBeVisible();
  await completeGuidedRehearsal(page);

  await expect(page.getByRole("heading", { name: "Your review, translated into practice" })).toBeVisible();
  await expect(page.getByText("Handled independently").first()).toBeVisible();
  expect(Date.now() - startedAt).toBeLessThan(180_000);
  expect(pageErrors).toEqual([]);
});

test("compact desktop preserves the focused rehearsal workspace", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await publishPreparedEpisode(page);
  await completeEpisode(page);

  await expect(page.getByText("Desktop rehearsal")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name: /northstar analytics sales renewal/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Northstar matter" })).toBeVisible();
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
});

test("phone layouts explain why the hands-on rehearsal moves to desktop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await publishPreparedEpisode(page);
  await completeEpisode(page);

  await expect(page.getByText("Desktop rehearsal")).toBeVisible();
  await expect(page.getByText(/screen at least 900px wide/i)).toBeVisible();
});
