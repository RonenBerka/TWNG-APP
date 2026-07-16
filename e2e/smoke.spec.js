import { test, expect } from '@playwright/test';

// Real-browser smoke tests. The app is served with dummy Supabase credentials,
// so data calls fail on purpose. We therefore assert only on the app *shell* and
// *routing* — never on data-dependent content — and we fail on uncaught
// exceptions (real crashes), not on handled data errors. This is deliberately
// noise-free: green means the app truly boots and routes for a user.

/** Collect uncaught page exceptions during a test. */
function trackCrashes(page) {
  const crashes = [];
  page.on('pageerror', (err) => crashes.push(err.message));
  return crashes;
}

test('homepage boots and React mounts', async ({ page }) => {
  const crashes = trackCrashes(page);

  await page.goto('/');
  await expect(page).toHaveTitle(/TWNG/i);

  // React mounted → the static boot fallback has been replaced.
  await expect(page.locator('#boot-fallback')).toHaveCount(0);
  await expect(page.locator('#root')).not.toBeEmpty();

  expect(crashes, `uncaught errors: ${crashes.join(' | ')}`).toEqual([]);
});

test('deep-linking to /explore boots the SPA without crashing', async ({ page }) => {
  const crashes = trackCrashes(page);

  await page.goto('/explore');
  await expect(page.locator('#boot-fallback')).toHaveCount(0);
  await expect(page.locator('#root')).not.toBeEmpty();

  expect(crashes, `uncaught errors: ${crashes.join(' | ')}`).toEqual([]);
});

test('the serial decoder tool page loads', async ({ page }) => {
  const crashes = trackCrashes(page);

  await page.goto('/decoder');
  await expect(page.locator('#boot-fallback')).toHaveCount(0);
  await expect(page.locator('#root')).not.toBeEmpty();

  expect(crashes, `uncaught errors: ${crashes.join(' | ')}`).toEqual([]);
});
