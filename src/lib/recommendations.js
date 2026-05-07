const AGE_TAG_MAP = {
  "3–5 years": "age-3-5",
};

const GENDER_TAG_MAP = {
  "Boys' styles": ["boys"],
  "Girls' styles": ["girls"],
  "Gender neutral": ["gender-neutral"],
  "Mix of everything": ["boys", "girls", "gender-neutral"],
};

const VIBE_TAG_MAP = {
  "Playful & colorful": ["playful", "colorful"],
  "Soft & cozy": ["soft-cozy"],
  "Mini adult": ["mini-adult"],
  "Sporty & active": ["sports"],
  "Earthy & organic": ["organic"],
  "Bold prints": ["bold-prints"],
};

const PRIORITY_TAG_MAP = {
  "Easy on / easy off": "easy-on-off",
  "Machine washable": "machine-washable",
  "Organic / non-toxic": "organic",
};

const OCCASION_TAG_MAP = {
  "Everyday play": "everyday-play",
  "Daycare": "school",
  "Special occasions": "special-occasions",
  "Outdoor adventures": "sports",
};

function parseBudgetMax(budget) {
  if (!budget || budget === "$60+") return Infinity;
  if (budget === "Under $20") return 20;
  if (budget === "$20–$40") return 40;
  if (budget === "$40–$60") return 60;
  return Infinity;
}

function genderMatches(productTags, genderTags) {
  if (productTags.includes("gender-neutral")) return true;
  return genderTags.some((t) => productTags.includes(t));
}

function collectSoftTags(answers) {
  const tags = [];
  for (const vibe of answers.style_vibe || []) {
    if (VIBE_TAG_MAP[vibe]) tags.push(...VIBE_TAG_MAP[vibe]);
  }
  for (const priority of answers.priorities || []) {
    if (PRIORITY_TAG_MAP[priority]) tags.push(PRIORITY_TAG_MAP[priority]);
  }
  for (const occasion of answers.occasions || []) {
    if (OCCASION_TAG_MAP[occasion]) tags.push(OCCASION_TAG_MAP[occasion]);
  }
  return tags;
}

function scoreProduct(product, softTags) {
  return softTags.filter((t) => product.tags.includes(t)).length;
}

function hardFilter(products, { ageTag, genderTags, budgetMax, enforceAge }) {
  return products.filter((p) => {
    if (p.price > budgetMax) return false;
    if (!genderMatches(p.tags, genderTags)) return false;
    if (enforceAge && ageTag && !p.tags.includes(ageTag)) return false;
    return true;
  });
}

export function getRecommendations(answers, allProducts) {
  const ageTag = AGE_TAG_MAP[answers.child_age] ?? null;
  const genderTags = GENDER_TAG_MAP[answers.child_gender] ?? ["boys", "girls", "gender-neutral"];
  const budgetMax = parseBudgetMax(answers.budget);
  const softTags = collectSoftTags(answers);

  let candidates = hardFilter(allProducts, { ageTag, genderTags, budgetMax, enforceAge: true });

  if (candidates.length < 3) {
    candidates = hardFilter(allProducts, { ageTag, genderTags, budgetMax, enforceAge: false });
  }

  return candidates
    .map((p) => ({ ...p, _score: scoreProduct(p, softTags) }))
    .sort((a, b) => b._score - a._score || a.price - b.price)
    .slice(0, 6)
    .map(({ _score, ...p }) => p);
}
