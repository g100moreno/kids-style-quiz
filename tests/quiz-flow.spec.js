import { test, expect } from '@playwright/test';

const PARENT_NAME = 'Alex';
const CHILD_NAME = 'Mia';

async function completeQuiz(page) {
  await page.goto('/');

  // Welcome
  await page.getByRole('button', { name: "Let's go!" }).click();

  // Parent name (text)
  await page.getByPlaceholder('Your first name').fill(PARENT_NAME);
  await page.getByRole('button', { name: /continue/i }).click();

  // Child name (text)
  await page.getByPlaceholder('Their first name').fill(CHILD_NAME);
  await page.getByRole('button', { name: /continue/i }).click();

  // Age (single — auto-advances)
  await page.getByRole('button', { name: /3–5 years/i }).click();

  // Gender (single — auto-advances)
  await page.getByRole('button', { name: /gender neutral/i }).click();

  // Sizes (multi-row)
  await page.getByRole('button', { name: '2T' }).first().click();   // Tops
  await page.getByRole('button', { name: '2T' }).nth(1).click();    // Bottoms
  await page.getByRole('button', { name: /size 5-6/i }).click();    // Shoes
  await page.getByRole('button', { name: /continue/i }).click();

  // Style vibe (multi)
  await page.getByRole('button', { name: /playful & colorful/i }).click();
  await page.getByRole('button', { name: /bold prints/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();

  // Priorities (multi)
  await page.getByRole('button', { name: /machine washable/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();

  // Occasions (multi)
  await page.getByRole('button', { name: /everyday play/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();

  // Avoid (optional — skip)
  await page.getByRole('button', { name: /skip/i }).click();

  // Budget (single — auto-advances)
  await page.getByRole('button', { name: /\$20–\$40/i }).click();

  // Frequency (single — auto-advances)
  await page.getByRole('button', { name: /every 3 months/i }).click();
}

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
