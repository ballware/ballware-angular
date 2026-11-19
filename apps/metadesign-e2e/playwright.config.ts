import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  outputDir: './playwright-output',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.METADESIGN_E2E_URL ?? 'http://localhost:4300',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    testIdAttribute: 'data-testid'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npx nx serve metadesign',
    url: 'http://localhost:4300/designer/revision',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      NX_DAEMON: 'false',
      BALLWARE_FIXTURE_ROOTS: './fixtures/e2e',
      BALLWARE_FIXTURE_TENANT: 'e2e'
    }
  }
});
