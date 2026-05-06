import { test, expect } from '@playwright/test';

test('welcome screen loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/kids-style-quiz/i);
  await expect(page.getByText('Little styles, big smiles')).toBeVisible();
  await expect(page.getByRole('button', { name: "Let's go!" })).toBeVisible();
});

test('clicking Let\'s go advances to first question', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: "Let's go!" }).click();
  await expect(page.getByText("What's your name?")).toBeVisible();
});
