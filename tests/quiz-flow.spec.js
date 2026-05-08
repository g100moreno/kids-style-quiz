import { test, expect } from '@playwright/test';
import { completeQuiz, PARENT_NAME, CHILD_NAME } from './helpers/quiz.js';

test('completes full quiz and shows summary', async ({ page }) => {
  await completeQuiz(page);

  await expect(page.getByText('All set!')).toBeVisible();
  // The "Child" summary tile shows "Mia, 3–5 years"
  await expect(page.getByText(new RegExp(`${CHILD_NAME},`, 'i'))).toBeVisible();
});

test('summary shows selected style vibes', async ({ page }) => {
  await completeQuiz(page);

  const summary = page.locator('text=Style vibes').locator('..');
  await expect(summary).toContainText('Playful & colorful');
});

test('Start over resets to welcome screen', async ({ page }) => {
  await completeQuiz(page);

  await page.getByRole('button', { name: /start over/i }).click();
  await expect(page.getByText('Little styles, big smiles')).toBeVisible();
});

test('text step advances on Enter key', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: "Let's go!" }).click();
  await page.getByPlaceholder('Your first name').fill(PARENT_NAME);
  await page.keyboard.press('Enter');
  await expect(page.getByText("And your little one's name?")).toBeVisible();
});
