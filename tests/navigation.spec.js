import { test, expect } from '@playwright/test';

test('progress bar is absent on welcome screen', async ({ page }) => {
  await page.goto('/');
  // Progress bar only appears on steps 1..(n-2)
  const progressBar = page.locator('[style*="linear-gradient"]');
  await expect(progressBar).toHaveCount(0);
});

test('progress bar appears on question steps', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: "Let's go!" }).click();
  const progressBar = page.locator('[style*="linear-gradient"]');
  await expect(progressBar).toBeVisible();
});

test('back button is absent on first question step', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: "Let's go!" }).click();
  await expect(page.getByRole('button', { name: /back/i })).toHaveCount(0);
});

test('back button appears from second question step onward', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: "Let's go!" }).click();
  await page.getByPlaceholder('Your first name').fill('Alex');
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.getByRole('button', { name: /back/i })).toBeVisible();
});

test('back button navigates to previous step', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: "Let's go!" }).click();
  await page.getByPlaceholder('Your first name').fill('Alex');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /back/i }).click();
  await expect(page.getByText("What's your name?")).toBeVisible();
});

test('Continue is disabled on empty text step', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: "Let's go!" }).click();
  const continueBtn = page.getByRole('button', { name: /continue/i });
  await expect(continueBtn).toBeDisabled();
});

test('Continue enables after typing in text step', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: "Let's go!" }).click();
  await page.getByPlaceholder('Your first name').fill('Alex');
  const continueBtn = page.getByRole('button', { name: /continue/i });
  await expect(continueBtn).toBeEnabled();
});

test('single-choice steps have no Continue button', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: "Let's go!" }).click();
  // Advance past the two text steps to reach the first single-choice step (age)
  await page.getByPlaceholder('Your first name').fill('Alex');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByPlaceholder('Their first name').fill('Mia');
  await page.getByRole('button', { name: /continue/i }).click();
  // Now on age step (single) — no Continue button
  await expect(page.getByRole('button', { name: /continue/i })).toHaveCount(0);
});
