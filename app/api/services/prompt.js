const RESEARCH_RULES = [
  "Prefer official vendor documentation, pricing pages, release notes, and changelogs.",
  "Use Google Search only to locate authoritative sources.",
  'Never invent a version, date, price, capability, or percentage; use "Unknown" or null when a fact cannot be verified.',
  "Pricing must use real USD list prices from official provider pages, with exact billing units and an official source URL for every plan.",
  'Use "Contact sales" when no public price exists, and never estimate a price.',
  "Set USD amounts only when the plan has a directly comparable public USD price.",
  "For price tracking, compare the same plan and billing unit across time.",
  "If a like-for-like historical price cannot be verified, return null current and previous USD amounts and explain why in changeSummary.",
  "Return up to twelve currently available models or recent releases, ordered newest to oldest, with meaningful change notes.",
  "For AI providers, include each separately selectable public model family or version, not only the flagship.",
  "Avoid marketing claims, repeated phrases, and vague labels.",
];

/** @param {unknown} value */
function serializeContext(value) {
  return JSON.stringify(value ?? null);
}

/**
 * @param {{ query: string, today: string, existingService?: unknown }} input
 */
export function createSearchPrompt({ query, today, existingService }) {
  return [
    `Research the developer technology, API, cloud service, framework, database, or SaaS product named "${query}" as of ${today}.`,
    "If the query is ambiguous, choose the best-known developer technology with that exact or closest name.",
    "Produce a polished catalog profile for a technical buyer, using concise complete sentences and consistent terminology.",
    ...RESEARCH_RULES,
    "Explain the free tier, overages, regional differences, taxes, and billing caveats.",
    "The main description must explain what the product or model is, its strongest differentiator, and who it is for in 35-60 factual words.",
    'Use "Not publicly documented" only when authoritative data cannot be verified.',
    "Category must be a concise standard category.",
    "Include 5-8 distinct capabilities, 3-6 specific use cases, and 3-8 named integrations.",
    `Existing catalog context, if any: ${serializeContext(existingService)}`,
  ].join(" ");
}

/**
 * @param {{ service: import("../../data").Service, today: string }} input
 */
export function createEnrichmentPrompt({ service, today }) {
  const snapshot = {
    version: service.version,
    releaseDate: service.releaseDate,
    pricing: service.pricing,
    features: service.features,
    versions: service.versions,
  };

  return [
    `Research ${service.name} (${service.category}) as of ${today} and return a concise developer catalog profile.`,
    ...RESEARCH_RULES,
    `The description must be specific to ${service.name}, not generic category copy.`,
    `Official starting points: ${service.website || "none"} and ${service.docs || "none"}.`,
    `Existing snapshot for comparison: ${serializeContext(snapshot)}`,
  ].join(" ");
}
