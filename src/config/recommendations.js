const config = {
  tagMap: {
    child_age: {
      "3–5 years": "age-3-5",
    },
    child_gender: {
      "Boys' styles": ["boys", "gender-neutral"],
      "Girls' styles": ["girls", "gender-neutral"],
      "Gender neutral": ["gender-neutral"],
      "Mix of everything": ["boys", "girls", "gender-neutral"],
    },
    style_vibe: {
      "Playful & colorful": ["playful", "colorful"],
      "Soft & cozy": ["soft-cozy"],
      "Mini adult": ["mini-adult"],
      "Sporty & active": ["sports"],
      "Earthy & organic": ["organic"],
      "Bold prints": ["bold-prints"],
    },
    priorities: {
      "Easy on / easy off": "easy-on-off",
      "Machine washable": "machine-washable",
      "Organic / non-toxic": "organic",
    },
    occasions: {
      "Everyday play": "everyday-play",
      "Daycare": "school",
      "Special occasions": "special-occasions",
      "Outdoor adventures": "sports",
    },
  },
  hardFilters: {
    ageKey: "child_age",
    genderKey: "child_gender",
    budgetMaxKey: "budgetMax",
  },
  scoringKeys: ["style_vibe", "priorities", "occasions"],
  minResults: 3,
  topN: 6,
};

function parseBudgetMax(budget) {
  if (!budget || budget === "$60+") return Infinity;
  if (budget === "Under $20") return 20;
  if (budget === "$20–$40") return 40;
  if (budget === "$40–$60") return 60;
  return Infinity;
}

export function prepareAnswers(answers) {
  return {
    ...answers,
    budgetMax: parseBudgetMax(answers.budget),
  };
}

export default config;
