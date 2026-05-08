export const PARENT_NAME = 'Alex';
export const CHILD_NAME = 'Mia';

export async function completeQuiz(page) {
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
