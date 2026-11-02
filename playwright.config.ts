import { defineConfig } from '@playwright/test'

const baseURL = process.env.PANEL_E2E_BASE_URL || 'http://127.0.0.1:3000'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 3000',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: { NUXT_PUBLIC_API_BASE: process.env.PANEL_E2E_API_URL || 'http://127.0.0.1:8011/api' },
    timeout: 120_000,
  },
})
