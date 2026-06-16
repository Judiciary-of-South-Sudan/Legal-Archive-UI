import { test, expect } from '@playwright/test';

const ADMIN_USER = process.env.E2E_ADMIN_USER ?? 'admin';
const ADMIN_PASS = process.env.E2E_ADMIN_PASS ?? 'admin123';

// ─── T1: Homepage ─────────────────────────────────────────────────────────────

test('homepage — nav and hero search visible', async ({ page }) => {
  await page.goto('/');

  // Header / nav is present
  await expect(page.locator('header')).toBeVisible();

  // At least one search input visible (hero bar or nav bar)
  await expect(
    page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="ابحث"]').first()
  ).toBeVisible();
});

// ─── T2: Search → detail ──────────────────────────────────────────────────────

test('search "constitution" → first law result → detail page renders title', async ({ page }) => {
  await page.goto('/search?q=constitution');

  // Wait for loading spinner to clear
  await page
    .locator('.animate-spin')
    .waitFor({ state: 'hidden', timeout: 15_000 })
    .catch(() => {/* no spinner — already done */});

  // At least one link into /laws/ must appear
  const firstLaw = page.locator('a[href^="/laws/"]').first();
  await expect(firstLaw).toBeVisible({ timeout: 10_000 });

  await firstLaw.click();

  // URL should now be a law detail
  await expect(page).toHaveURL(/\/laws\//, { timeout: 8_000 });

  // Primary heading with the document title is visible
  await expect(page.locator('h1').first()).toBeVisible();
});

// ─── T3: Admin upload flow ────────────────────────────────────────────────────

test('admin login → upload law form accessible', async ({ page }) => {
  await page.goto('/login');

  // Fill credentials
  await page
    .locator('input[name="username"], input[placeholder*="sername"], input[id="username"]')
    .fill(ADMIN_USER);
  await page
    .locator('input[type="password"]')
    .fill(ADMIN_PASS);

  await page.locator('button[type="submit"]').click();

  // Should land on admin dashboard or be redirected there
  await expect(page).toHaveURL(/admin|dashboard/, { timeout: 10_000 });

  // Navigate to upload law form
  await page.goto('/admin/upload-law');

  // Upload form should be rendered
  await expect(page.locator('form')).toBeVisible({ timeout: 8_000 });

  // Title input should exist
  await expect(
    page.locator('input[name="title"], input[id="title"]')
  ).toBeVisible();
});

// ─── T4: Rate limiting ────────────────────────────────────────────────────────

test('5 failed logins on a real account → account locked, 429 ACCOUNT_LOCKED shown', async ({ page }) => {
  // AuthService.login() only locks out *existing* usernames (user != null check) — a
  // nonexistent username never reaches the lockout branch, so this test requires a real,
  // disposable test account to be pre-seeded in the target environment.
  const lockUser = process.env.E2E_LOCKOUT_USER;
  if (!lockUser) {
    throw new Error(
      'E2E_LOCKOUT_USER env var is required for the lockout test — it must be a real, ' +
      'pre-seeded account (a nonexistent username never triggers AccountLockedException).'
    );
  }
  const badPass = 'definitely_wrong_password_xyz';

  // AuthService.MAX_ATTEMPTS = 5 — the 5th bad attempt locks the account for 15 minutes.
  for (let attempt = 1; attempt <= 5; attempt++) {
    await page.goto('/login');

    await page
      .locator('input[name="username"], input[id="username"]')
      .fill(lockUser);
    await page.locator('input[type="password"]').fill(badPass);
    await page.locator('button[type="submit"]').click();

    // Brief pause so the backend can register each attempt
    await page.waitForTimeout(200);
  }

  // After 5 attempts the UI should surface a lock / rate-limit message
  const lockMessage = page.locator(
    'text=/locked|too many|rate|429/i'
  );
  await expect(lockMessage).toBeVisible({ timeout: 6_000 });
});
