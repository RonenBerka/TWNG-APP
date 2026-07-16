import { defineConfig } from '@playwright/test';

// Real-browser test config. The web server builds the app with *dummy* Supabase
// credentials and serves the production bundle, so tests run fully offline and
// never depend on live data — that keeps them free of false alarms.
//
// Locally, point PW_CHROMIUM_PATH at the pre-installed Chromium so nothing is
// downloaded. In CI, leave it unset and let Playwright use its managed browser.

const PORT = 4173;
const localChromium = process.env.PW_CHROMIUM_PATH;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    ...(localChromium ? { launchOptions: { executablePath: localChromium } } : {}),
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_SUPABASE_URL: 'https://smoke-test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'smoke-test-anon-key',
    },
  },
});
