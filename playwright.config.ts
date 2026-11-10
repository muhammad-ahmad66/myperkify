import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  // Tests reset the shared in-memory mock API, so they cannot run side by side.
  workers: 1,
  use: { baseURL, trace: 'on-first-retry' },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'phone', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 800 } } },
  ],
  webServer: { command: 'npm run dev', url: baseURL, reuseExistingServer: true },
});
