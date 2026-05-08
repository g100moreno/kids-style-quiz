import { test, expect } from '@playwright/test';
import { completeQuiz, CHILD_NAME } from './helpers/quiz.js';

const SHOPIFY_GRAPHQL = '**/api/2024-10/graphql.json';

function makeProduct({ id, title, handle, tags, price, image = null }) {
  return {
    node: {
      id: `gid://shopify/Product/${id}`,
      title,
      description: `${title} description`,
      handle,
      tags,
      onlineStoreUrl: `https://shop.example.com/products/${handle}`,
      priceRange: {
        minVariantPrice: { amount: String(price), currencyCode: 'USD' },
      },
      featuredImage: image ? { url: image, altText: title } : null,
    },
  };
}

function shopifyResponse(products) {
  return { data: { products: { edges: products } } };
}

// Quiz answers map to these tags via src/lib/recommendations.js:
//   age 3–5 → "age-3-5"
//   gender neutral → "gender-neutral"
//   vibes Playful & colorful + Bold prints → "playful","colorful","bold-prints"
//   priority Machine washable → "machine-washable"
//   occasion Everyday play → "everyday-play"
//   budget $20–$40 → price ≤ 40
const MATCHING_PRODUCTS = [
  makeProduct({
    id: '1', title: 'Rainbow Romper', handle: 'rainbow-romper',
    tags: ['age-3-5', 'gender-neutral', 'playful', 'colorful', 'machine-washable', 'everyday-play'],
    price: 24.0,
  }),
  makeProduct({
    id: '2', title: 'Sunshine Tee', handle: 'sunshine-tee',
    tags: ['age-3-5', 'gender-neutral', 'playful', 'bold-prints', 'machine-washable', 'everyday-play'],
    price: 28.0,
  }),
  makeProduct({
    id: '3', title: 'Cozy Joggers', handle: 'cozy-joggers',
    tags: ['age-3-5', 'gender-neutral', 'playful', 'machine-washable', 'everyday-play'],
    price: 32.0,
  }),
  makeProduct({
    id: '4', title: 'Tiger Stripe Hoodie', handle: 'tiger-stripe-hoodie',
    tags: ['age-3-5', 'gender-neutral', 'bold-prints', 'colorful', 'machine-washable', 'everyday-play'],
    price: 38.0,
  }),
];

// All over budget — the $20–$40 hard filter rejects every one,
// even after the age-fallback path in getRecommendations.
const NON_MATCHING_PRODUCTS = [
  makeProduct({
    id: '90', title: 'Designer Cashmere Coat', handle: 'cashmere-coat',
    tags: ['age-3-5', 'gender-neutral', 'playful', 'machine-washable', 'everyday-play'],
    price: 89.99,
  }),
  makeProduct({
    id: '91', title: 'Luxury Silk Dress', handle: 'silk-dress',
    tags: ['age-3-5', 'gender-neutral', 'bold-prints', 'machine-washable', 'everyday-play'],
    price: 120.0,
  }),
];

function fulfillJson(route, body, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

test('shows loading state before products render', async ({ page }) => {
  await page.route(SHOPIFY_GRAPHQL, async (route) => {
    await new Promise((r) => setTimeout(r, 2000));
    await fulfillJson(route, shopifyResponse(MATCHING_PRODUCTS));
  });

  await completeQuiz(page);
  await page.getByRole('button', { name: /see your matches/i }).click();

  await expect(
    page.getByText(`Finding the best picks for ${CHILD_NAME}…`)
  ).toBeVisible();
});

test('happy path renders matching products', async ({ page }) => {
  await page.route(SHOPIFY_GRAPHQL, (route) =>
    fulfillJson(route, shopifyResponse(MATCHING_PRODUCTS))
  );

  await completeQuiz(page);
  await page.getByRole('button', { name: /see your matches/i }).click();

  await expect(page.getByText(`Perfect picks for ${CHILD_NAME}`)).toBeVisible();
  await expect(page.getByText('Rainbow Romper')).toBeVisible();
  await expect(
    page.getByRole('link', { name: /view product/i }).first()
  ).toBeVisible();
});

test('shows error state when API returns 500', async ({ page }) => {
  await page.route(SHOPIFY_GRAPHQL, (route) =>
    route.fulfill({ status: 500, contentType: 'text/plain', body: 'boom' })
  );

  await completeQuiz(page);
  await page.getByRole('button', { name: /see your matches/i }).click();

  await expect(
    page.getByText("Couldn't load products right now.")
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
});

test('retry recovers from a transient error', async ({ page }) => {
  // Mode flag (not a call counter) so the mock is robust to React StrictMode
  // double-firing the effect on mount in dev.
  let mode = 'fail';
  await page.route(SHOPIFY_GRAPHQL, async (route) => {
    if (mode === 'fail') {
      return route.fulfill({ status: 500, contentType: 'text/plain', body: 'boom' });
    }
    return fulfillJson(route, shopifyResponse(MATCHING_PRODUCTS));
  });

  await completeQuiz(page);
  await page.getByRole('button', { name: /see your matches/i }).click();

  await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
  mode = 'ok';
  await page.getByRole('button', { name: /try again/i }).click();

  await expect(page.getByText(`Perfect picks for ${CHILD_NAME}`)).toBeVisible();
  await expect(page.getByText('Rainbow Romper')).toBeVisible();
});

test('shows empty state when no products match filters', async ({ page }) => {
  await page.route(SHOPIFY_GRAPHQL, (route) =>
    fulfillJson(route, shopifyResponse(NON_MATCHING_PRODUCTS))
  );

  await completeQuiz(page);
  await page.getByRole('button', { name: /see your matches/i }).click();

  await expect(
    page.getByText(`No products matched ${CHILD_NAME}'s profile right now.`)
  ).toBeVisible();
  // The empty-state Start over button lives inside the matches panel,
  // alongside the existing summary Start over button — scope by name+role.
  await expect(
    page.getByRole('button', { name: /start over/i }).last()
  ).toBeVisible();
});
