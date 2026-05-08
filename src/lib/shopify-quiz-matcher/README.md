# shopify-quiz-matcher

Shopify Storefront-backed product matching engine for quiz-driven recommendation flows.

Drop this directory into any project, write a config that maps your quiz answers to Shopify product tags, and you get a working "answer a quiz, see matching products" pipeline. The library is domain-agnostic — clothing, pets, plants, fashion, and other product domains all use the same engine.

## How it works

1. **Fetch** — `fetchAllProducts` pulls up to 250 products from the Shopify Storefront GraphQL API and normalizes each one to `{ id, title, price, image, productUrl, tags, … }`.
2. **Hard filter** — `matchProducts` walks the fetched products and rejects any that fail a must-match check: their price exceeds the budget cap, or they don't carry at least one tag from the gender / age / other hard-filter mappings.
3. **Relax-age fallback** — if the strict pass produces fewer than `minResults`, it re-runs the hard filter without the age constraint. Budget and gender remain enforced. This handles narrow inventories where the exact age tag would otherwise return nothing.
4. **Soft score** — surviving products are scored by how many of the selected soft-match tags they carry (vibes, priorities, occasions, or whatever keys the consumer puts in `scoringKeys`). Each matching tag is +1.
5. **Sort and slice** — results sort by score descending, then price ascending, and the top `topN` are returned.

The library has zero dependencies beyond the standard `fetch` global.

## API

### `fetchAllProducts({ domain, storefrontToken }) → Promise<Product[]>`

Network-only. Posts a Storefront GraphQL query to `https://{domain}/api/2024-10/graphql.json` and returns normalized products. Returns `[]` on HTTP error, GraphQL error, or network failure (errors are logged via `console.error`).

A `Product` looks like:

```
{
  id, title, description,
  price,        // number
  currency,     // ISO code, e.g. "USD"
  image,        // url string or null
  imageAlt,     // string
  productUrl,   // canonical link to the product page
  tags,         // array of lowercased tag strings
}
```

### `matchProducts(products, answers, config) → Product[]`

Pure function. Filters and scores `products` against the user's quiz `answers` using the rules in `config`. Does no network I/O. Same `products` + `answers` + `config` always returns the same result.

### `fetchAndMatch({ shopify, answers, config }) → Promise<Product[]>`

Convenience wrapper: calls `fetchAllProducts(shopify)` then `matchProducts(products, answers, config)`. Useful for the simple case; if you need to distinguish "fetch failed" from "no matches" in your UI, call the two separately.

## Config reference

```js
const config = {
  // Quiz answer values → Shopify product tag(s).
  // Each leaf can be a string, an array of strings, or null (no tags).
  tagMap: {
    age:        { "0-2 years": "age-young", "3-5 years": "age-older" },
    gender:     { boys: "gender-boys", girls: "gender-girls", neutral: null },
    vibes:      { soft: "tag-soft", bold: ["tag-bold", "tag-loud"] },
    priorities: { /* ... */ },
    occasions:  { /* ... */ },
  },

  // Which answer keys drive the must-match step.
  hardFilters: {
    ageKey:       "age",      // tag-based hard filter; relaxable
    genderKey:    "gender",   // tag-based hard filter
    budgetMaxKey: "budget",   // answer field whose numeric value caps price
  },

  // Soft-scoring keys: more matching tags → higher score → ranked higher.
  scoringKeys: ["vibes", "priorities", "occasions"],

  minResults: 3,  // if strict hard-filter result count < this, retry without age
  topN: 6,        // final results returned
};
```

Notes:

- `answers[budgetMaxKey]` must already be a number (or undefined for no cap). If your UI captures budget as a string like `"$20–$40"`, normalize it before calling `matchProducts` — that conversion is domain-specific and lives in your config module, not in the lib.
- An answer value can be a single value or an array (multi-select). Array values are flattened through `tagMap` and combined.
- A `null` mapping in `tagMap` means "no tag for this answer value" — it produces no constraint on a hard filter and contributes nothing to soft scoring.
- Hard filters with no resolved tags (because the answer is missing or maps to `null`) are skipped, not treated as "match nothing".

## Example: pet-subscription quiz

```js
import { fetchAndMatch } from "./shopify-quiz-matcher";

const config = {
  tagMap: {
    species:    { dog: "pet-dog", cat: "pet-cat" },
    size:       { small: "size-small", medium: "size-medium", large: "size-large" },
    activity:   { couch: "low-energy", active: "high-energy" },
    diet:       { grain_free: "diet-grain-free", organic: "diet-organic" },
    chewStyle:  { gentle: "chew-soft", aggressive: ["chew-tough", "chew-durable"] },
  },
  hardFilters: {
    ageKey:       "lifeStage",   // not present in tagMap above — would be added for real use
    genderKey:    "species",     // "must match the pet species" reuses the gender slot
    budgetMaxKey: "monthlyCap",
  },
  scoringKeys: ["activity", "diet", "chewStyle"],
  minResults: 3,
  topN: 6,
};

const answers = {
  species:    "dog",
  lifeStage:  "adult",
  activity:   "active",
  diet:       ["grain_free", "organic"],
  chewStyle:  "aggressive",
  monthlyCap: 45,
};

const matches = await fetchAndMatch({
  shopify: {
    domain: "petbox-demo.myshopify.com",
    storefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
  },
  answers,
  config,
});
```

Same engine, totally different domain — only the config changed.

## Live example

The style-profile quiz that ships in this repository is a real consumer of the lib. Its config lives at `src/config/recommendations.js` and shows the full shape: the `tagMap`, the `hardFilters`, a `prepareAnswers` helper that converts the user-facing budget string into a number for `budgetMaxKey`, and the call site in `src/components/ProductMatches.jsx` that wires it all together.
