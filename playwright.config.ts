import { defineConfig, devices } from "@playwright/test";

const repositoryBase = process.env.GITHUB_ACTIONS ? "/smu-lit/" : "/";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:4173${repositoryBase}`,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run preview:e2e",
    url: `http://127.0.0.1:4173${repositoryBase}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
