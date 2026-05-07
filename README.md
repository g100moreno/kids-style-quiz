![Playwright Tests](https://github.com/g100moreno/kids-style-quiz/actions/workflows/playwright.yml/badge.svg)

# Trendsend Kids — Style Profile Quiz

A parent-focused style onboarding experience for a children's clothing subscription concept, inspired by [Trendsend by Evereve](https://www.trendsend.com). Parents fill out a style profile for their child, and a stylist uses it to curate their first box.

## Live Demo

🔗 [View Live](https://kids-style-quiz.vercel.app/)

## What It Does

Guides parents through a personalized quiz to build a style profile for their baby or toddler:

- Parent and child name collection
- Child's age range (newborn through 5T)
- Gender preference or gender-neutral styling
- Sizing for tops, bottoms, and shoes in baby/toddler sizes
- Style vibes like "Soft & cozy," "Bold prints," and "Mini adult"
- Parent priorities such as machine washable, easy on/off, and organic fabrics
- Things to avoid like choking hazard buttons and scratchy tags
- Budget and delivery frequency
- Colorful summary screen with all selections

## Shopify Integration

After completing the quiz, real products are fetched from a Shopify Storefront API and
recommended based on the answers — age range, gender, style vibes, priorities, occasions,
and budget.

### How it works

- **`src/lib/shopify.js`** — GraphQL client that fetches up to 250 products from the
  Storefront API and normalizes them to `{ id, title, price, image, productUrl, tags }`.
- **`src/lib/recommendations.js`** — Maps quiz answers to Shopify product tags, then
  applies a hard filter (age tag + gender + budget ceiling). If fewer than 3 products
  survive, the age constraint is relaxed and the filter re-runs. Each surviving product
  is scored by how many of the selected style vibe, priority, and occasion tags it
  carries. The top 6 are returned, sorted by score descending then price ascending.
- **`src/components/ProductMatches.jsx`** — Handles the four fetch states (loading,
  error, empty, ok) and renders a product grid with image, price, and a link to the
  Shopify product page.

### Demo store

The integration points at a Shopify dev store. Dev stores are password-protected by
default (a Shopify limitation on free dev plans) — first-time visitors need to enter
the password **skayld** once, after which product links land directly on the product
page for the rest of the session.

### Configuration

To point at a different store, set these variables in `.env.local`:

| Variable | Description |
|---|---|
| `VITE_SHOPIFY_DOMAIN` | Store domain, e.g. `mystore.myshopify.com` |
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | Storefront API access token (read-only product scopes) |

### Scale note

The current implementation fetches all products and filters client-side, which is
appropriate for a demo store with 20 products. For a production store with thousands of
products, the GraphQL query would push filters server-side using Shopify's `query`
argument — e.g. `products(first: 6, query: "tag:age-3-5 AND tag:machine-washable")`.

## Built With

- React
- Vite
- Deployed on Vercel

## Features

- Multi-step form with gradient progress bar
- Single-select options with emoji that auto-advance
- Multi-select pill buttons with pop animations
- Size selector with baby/toddler-specific options
- Optional "things to avoid" step with skip option
- Smooth fade transitions between steps
- Warm, playful design with peach/mint/lavender palette
- Fully responsive

## Run Locally
```bash
git clone https://github.com/g100moreno/kids-style-quiz.git
cd kids-style-quiz
npm install
npm run dev
```

## Testing

The test suite uses [Playwright](https://playwright.dev) and covers three areas:

| File | What it covers |
|---|---|
| `tests/smoke.spec.js` | Page loads, welcome screen renders, first navigation works |
| `tests/quiz-flow.spec.js` | Full happy-path walkthrough, summary content, start over, Enter-key navigation |
| `tests/navigation.spec.js` | Progress bar visibility, back button logic, Continue disabled/enabled state, single-choice steps |
| `tests/shopify.spec.js` | Shopify integration tests — coming in next commit |

### Run against the local dev server

The test runner starts the dev server automatically — no separate terminal needed.

```bash
npm install
npx playwright install   # first time only
npx playwright test
```

Run a single file or test:

```bash
npx playwright test tests/smoke.spec.js
npx playwright test --grep "completes full quiz"
```

### Run against the live Vercel URL

Set `BASE_URL` to skip the local dev server entirely:

```bash
BASE_URL=https://kids-style-quiz.vercel.app npx playwright test
```

This is useful for smoke-testing a deployment without checking out the repo locally.

### Future improvements

- **Visual regression** — `toHaveScreenshot()` snapshots to catch unintended UI changes across the palette and animations
- **Real accessibility scans** — integrate [axe-core](https://github.com/dequelabs/axe-core) via `@axe-core/playwright` to audit ARIA, contrast, and keyboard trappability on each step
- **Request mocking** — use `page.route()` to intercept any future external API calls (stylist matching, profile submission) so tests stay fast and deterministic
- **CI sharding** — split the suite across parallel runners with `--shard=1/4` to cut wall-clock time as the suite grows

## What I'd Improve With More Time

- Add photo upload so parents can share inspo or photos of their child
- Growth tracking to auto-suggest size updates over time
- Sibling support for styling multiple kids from one profile
- Connect to a backend to store profiles and match with stylists
- Add outfit preference images (pick between visual options instead of text)
