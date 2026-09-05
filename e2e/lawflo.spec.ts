import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const demoAssets = path.resolve(process.cwd(), "src/demo/assets");

async function publishBundled(page: Page) {
  await page.getByRole("button", { name: "Load synthetic demo pack" }).click();
  await expect(page.getByText("Draft ready for named approval")).toBeVisible();
  await page.getByRole("button", { name: "Approve exact version" }).click();
  await page.getByRole("button", { name: "Publish learning module" }).click();
  await expect(page.getByText("Ready to learn the workflow")).toBeVisible();
}

async function publishUploaded(page: Page) {
  const files = {
    "Select workflow document": "contract-review-workflow.md",
    "Select legal playbook": "contract-review-playbook.md",
    "Select approved contract template": "standard-sales-renewal.md",
    "Select submitted renewal contract": "submitted-sales-renewal.md",
    "Select contributor portrait": "maya-tan.png",
  } as const;

  for (const [label, filename] of Object.entries(files)) {
    await page.getByLabel(label).setInputFiles(path.join(demoAssets, filename));
    await expect(page.getByText(filename, { exact: true })).toBeVisible();
  }
  await expect(page.getByText("Five inputs ready")).toBeVisible();
  await expect(page.getByText("Draft ready for named approval")).toBeVisible();
  await page.getByRole("button", { name: "Approve exact version" }).click();
  await page.getByRole("button", { name: "Publish learning module" }).click();
  await expect(page.getByText("Ready to learn the workflow")).toBeVisible();
}

async function reachCheckpoint(page: Page) {
  await page.getByRole("button", { name: "Watch episode" }).click();
  await page.getByRole("button", { name: /chapter 6/i }).click();
  await expect(page.getByRole("heading", { name: "What should happen next?" })).toBeVisible();
}

async function enterRehearsal(page: Page) {
  await reachCheckpoint(page);
  await page.getByRole("button", { name: "Escalate to legal review" }).click();
  await page.getByRole("button", { name: "Continue to rehearsal" }).click();
  await expect(page.locator("main.matter")).toBeAttached();
}

async function verifyAllFindings(page: Page) {
  for (const label of ["Contract value", "Template version", "Personal data processing", "Governing law"]) {
    await page.getByRole("button", { name: `Open ${label}`, exact: true }).click();
    await page.getByRole("button", { name: `Confirm ${label}`, exact: true }).click();
  }
  await page.getByRole("button", { name: "Open Material standard-term change", exact: true }).click();
  await page.getByRole("button", { name: "Correct Material standard-term change", exact: true }).click();
}

async function readPublishedManifest(page: Page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem("lawflo.published-bundle.v1");
    if (!raw) throw new Error("Published bundle was not persisted");
    const bundle = JSON.parse(raw) as {
      manifest: { bundleId: string; approvalFingerprint: string; scenarioRefs: Array<{ scenarioId: string; contentFingerprint: string }> };
    };
    return bundle.manifest;
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("golden path repairs unsafe reliance and preserves evidence locally", async ({ page }) => {
  const pageErrors: string[] = [];
  const networkViolations: string[] = [];
  let learnerActionsStarted = false;
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("websocket", (socket) => {
    if (learnerActionsStarted) networkViolations.push(`websocket:${socket.url()}`);
  });
  page.on("request", (request) => {
    if (!learnerActionsStarted) return;
    const type = request.resourceType();
    const requestUrl = new URL(request.url());
    const appUrl = new URL(page.url());
    if (["fetch", "xhr"].includes(type) || requestUrl.origin !== appUrl.origin) {
      networkViolations.push(`${type}:${request.url()}`);
    }
  });

  await page.waitForLoadState("networkidle");
  learnerActionsStarted = true;
  await publishBundled(page);
  await reachCheckpoint(page);
  await page.getByRole("button", { name: "Send to business approval" }).click();
  await expect(page.getByRole("alert")).toContainText("Low value never cancels a material redline");
  await page.getByRole("button", { name: "Escalate to legal review" }).click();
  await page.getByRole("button", { name: "Continue to rehearsal" }).click();

  await page.getByRole("button", { name: "Open Northstar matter" }).click();
  await page.getByRole("button", { name: "Run AI review" }).click();
  await page.getByRole("button", { name: "Choose Business approval" }).click();
  await page.getByRole("button", { name: "Submit route" }).click();
  await expect(page.getByRole("status")).toContainText("Verify the material AI findings");
  await page.getByRole("button", { name: "Open AI verification policy source" }).click();

  await verifyAllFindings(page);
  await page.getByRole("button", { name: "Check repair" }).click();
  await page.getByRole("button", { name: "Compare liability clause" }).click();
  await page.getByRole("button", { name: "Check repair" }).click();
  await page.getByRole("button", { name: /open material standard-term changes require legal review/i }).click();
  await page.getByRole("button", { name: "Check repair" }).click();
  await page.getByRole("button", { name: "Choose Legal review" }).click();
  await page.getByRole("button", { name: "Check repair" }).click();
  await page.getByRole("button", { name: "Submit route" }).click();
  await page.getByRole("button", { name: "Inspect audit trail" }).click();

  await expect(page.getByRole("heading", { name: "Your review, translated into practice" })).toBeVisible();
  await expect(page.getByText("Repaired with guidance").first()).toBeVisible();
  await page.getByRole("button", { name: "Open workflow guide" }).click();
  await expect(page.getByRole("heading", { name: "Your sales-renewal legal AI workflow guide" })).toBeVisible();
  await page.getByRole("button", { name: "Try the Marigold matter" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Marigold Systems Sales Renewal" })).toBeVisible();
  await page.getByRole("button", { name: "Guide" }).click();
  await expect(page.getByRole("heading", { name: "Your sales-renewal legal AI workflow guide" })).toBeVisible();
  await page.getByRole("button", { name: "How this is governed" }).click();
  await expect(page.getByRole("heading", { name: "Evidence chain" })).toBeVisible();

  const publishedEvents = await page.evaluate(() => {
    const raw = localStorage.getItem("lawflo.observed-events.v1");
    const events = raw ? (JSON.parse(raw) as { events: Array<{ type: string }> }).events : [];
    return events.filter((event) => event.type === "module_published").length;
  });
  expect(publishedEvents).toBe(1);
  expect(networkViolations).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("uploaded and bundled demo packs compile to the same approved manifest", async ({ page }) => {
  await publishBundled(page);
  const bundled = await readPublishedManifest(page);
  await page.getByRole("button", { name: "Reset demo" }).click();

  await publishUploaded(page);
  const uploaded = await readPublishedManifest(page);
  expect(uploaded.bundleId).toBe(bundled.bundleId);
  expect(uploaded.approvalFingerprint).toBe(bundled.approvalFingerprint);
  expect(uploaded.scenarioRefs).toEqual(bundled.scenarioRefs);
});

test("real timer checkpoint, refresh resume and reset are deterministic", async ({ page }) => {
  await page.clock.install();
  await publishBundled(page);
  await page.getByRole("button", { name: "Watch episode" }).click();
  await page.getByRole("button", { name: "Play episode" }).click();
  await page.clock.runFor(68_000);
  await expect(page.getByRole("heading", { name: "What should happen next?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play episode" })).toBeDisabled();
  await page.getByRole("button", { name: "Escalate to legal review" }).click();
  await expect(page.getByRole("button", { name: "Continue to rehearsal" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "Continue to rehearsal" })).toBeVisible();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByRole("heading", { name: "Turn legal AI pioneers into everyday practice." })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Publish learning module" })).toBeDisabled();
});

for (const viewport of [
  { name: "wide desktop", width: 1440, height: 900 },
  { name: "compact desktop", width: 1024, height: 768 },
]) {
  test(`${viewport.name} supports the simulated workspace`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await publishBundled(page);
    await enterRehearsal(page);
    await expect(page.getByText("Review path")).toBeVisible();
    await expect(page.getByText("Desktop rehearsal")).toBeHidden();
  });
}

test("narrow screens explain the desktop boundary", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await publishBundled(page);
  await enterRehearsal(page);
  await expect(page.getByText("Desktop rehearsal")).toBeVisible();
  await expect(page.getByText(/screen at least 900px wide/i)).toBeVisible();
});

test("the primary publication path works from the keyboard", async ({ page }) => {
  const load = page.getByRole("button", { name: "Load synthetic demo pack" });
  await load.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Draft ready for named approval")).toBeVisible();
  const approve = page.getByRole("button", { name: "Approve exact version" });
  await approve.focus();
  await page.keyboard.press("Enter");
  const publish = page.getByRole("button", { name: "Publish learning module" });
  await publish.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Ready to learn the workflow")).toBeVisible();
});
