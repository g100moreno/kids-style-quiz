function lookupTags(tagMap, key, value) {
  const mapped = tagMap?.[key]?.[value];
  if (mapped == null) return [];
  return Array.isArray(mapped) ? mapped : [mapped];
}

function collectMappedTags(answers, tagMap, key) {
  const value = answers?.[key];
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.flatMap((v) => lookupTags(tagMap, key, v));
  }
  return lookupTags(tagMap, key, value);
}

function applyHardFilter(products, answers, config, { enforceAge }) {
  const { tagMap = {}, hardFilters = {} } = config;
  const ageKey = hardFilters.ageKey;
  const genderKey = hardFilters.genderKey;
  const budgetMaxKey = hardFilters.budgetMaxKey;

  const ageTags = ageKey ? collectMappedTags(answers, tagMap, ageKey) : [];
  const genderTags = genderKey ? collectMappedTags(answers, tagMap, genderKey) : [];
  const rawBudget = budgetMaxKey ? answers?.[budgetMaxKey] : undefined;
  const budgetMax = typeof rawBudget === "number" && Number.isFinite(rawBudget) ? rawBudget : Infinity;

  return products.filter((p) => {
    if (p.price > budgetMax) return false;
    if (genderTags.length && !genderTags.some((t) => p.tags.includes(t))) return false;
    if (enforceAge && ageTags.length && !ageTags.some((t) => p.tags.includes(t))) return false;
    return true;
  });
}

function collectSoftTags(answers, tagMap, scoringKeys) {
  return scoringKeys.flatMap((key) => collectMappedTags(answers, tagMap, key));
}

function scoreAgainst(product, softTags) {
  return softTags.reduce((n, t) => (product.tags.includes(t) ? n + 1 : n), 0);
}

export function matchProducts(products, answers, config) {
  const { scoringKeys = [], minResults = 3, topN = 6 } = config;

  let candidates = applyHardFilter(products, answers, config, { enforceAge: true });
  if (candidates.length < minResults) {
    candidates = applyHardFilter(products, answers, config, { enforceAge: false });
  }

  const softTags = collectSoftTags(answers, config.tagMap, scoringKeys);

  return candidates
    .map((product) => ({ product, score: scoreAgainst(product, softTags) }))
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
    .slice(0, topN)
    .map(({ product }) => product);
}
