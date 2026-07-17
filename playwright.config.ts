/// <reference types="node" />

import { defineConfig } from '@playwright/test';

declare const process: { env: Record<string, string | undefined> };

const baseURL = process.env['E2E_BASE_URL'] || process.env['PLAYWRIGHT_BASE_URL'] || 'http://localhost:4200';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 2,
  workers: undefined,
  outputDir: 'test-results',
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Uses the system-installed Google Chrome instead of Playwright's managed
    // Chromium/headless-shell builds — the CDN download for those has proven
    // unreliable in this environment. Chrome supports headless mode natively,
    // so no separate headless-shell binary is needed.
    channel: 'chrome'
  },
  webServer: {
    command: 'npm run start -- --port=4200 --host=127.0.0.1',
    url: baseURL || 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000
  },
  reporter: [['list']]
});
