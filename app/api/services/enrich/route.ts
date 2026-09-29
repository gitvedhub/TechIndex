import { env } from "cloudflare:workers";
import { services, type Service } from "../../../data";
import { createEnrichmentPrompt } from "../prompt.js";

type GeminiEnvironment = {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
};

type GeminiPayload = {
  description: string;
  version: string;
  releaseDate: string;
  pricing: string;
  freeTier: string;
  billingNotes: string;
  plans: { name: string; price: string; description: string; usdAmount: number | null; billingUnit: string; sourceUrl: string }[];
  context: string;
  status: string;
  features: string[];
  versions: { name: string; date: string; note: string }[];
  previousVersion: string;
  previousPricing: string;
  currentUsdAmount: number | null;
  previousUsdAmount: number | null;
  priceEffectiveDate: string;
  priceSourceUrl: string;
  changeSummary: string;
};

const responseSchema = {
  type: "object",
  properties: {
    description: { type: "string", description: "Two concise sentences explaining what the service does and its main developer use cases." },
    version: { type: "string", description: "Latest stable product, API, framework, or model version. Use Latest when the provider has no unified version." },
    releaseDate: { type: "string", description: "Release date formatted as YYYY-MM-DD, or Unknown when it cannot be verified." },
    pricing: { type: "string", description: "Short current entry pricing summary including units when relevant." },
    freeTier: { type: "string", description: "Exact public free-tier allowance and limits, or Not publicly documented." },
    billingNotes: { type: "string", description: "Billing units, overages, regional pricing, taxes, and important caveats." },
    plans: { type: "array", items: { type: "object", properties: { name: { type: "string" }, price: { type: "string" }, description: { type: "string" }, usdAmount: { type: ["number", "null"] }, billingUnit: { type: "string" }, sourceUrl: { type: "string" } }, required: ["name", "price", "description", "usdAmount", "billingUnit", "sourceUrl"] } },
    context: { type: "string", description: "Most useful capacity, scale, context-window, or deployment characteristic." },
    status: { type: "string", description: "Stable, Preview, Beta, Deprecated, or Rolling service." },
    features: { type: "array", items: { type: "string" }, description: "Four to six concrete capabilities." },
    versions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          date: { type: "string", description: "Release month formatted as MMM YYYY, or Unknown." },
          note: { type: "string", description: "Short factual release highlight." },
        },
        required: ["name", "date", "note"],
      },
      description: "Up to four releases, newest first.",
    },
    previousVersion: { type: "string" },
    previousPricing: { type: "string" },
    currentUsdAmount: { type: ["number", "null"], description: "Current official USD amount for the tracked comparable plan and billing unit." },
    previousUsdAmount: { type: ["number", "null"], description: "Previous official USD amount for the exact same plan and billing unit." },
    priceEffectiveDate: { type: "string" },
    priceSourceUrl: { type: "string", description: "Official pricing page or announcement supporting the tracked price." },
    changeSummary: { type: "string", description: "One factual sentence comparing the latest and previous tracked release." },
  },
  required: ["description", "version", "releaseDate", "pricing", "freeTier", "billingNotes", "plans", "context", "status", "features", "versions", "previousVersion", "previousPricing", "currentUsdAmount", "previousUsdAmount", "priceEffectiveDate", "priceSourceUrl", "changeSummary"],
};

const cleanText = (value: unknown, fallback: string) => typeof value === "string" && value.trim() ? value.trim() : fallback;
const cleanList = (value: unknown, fallback: string[]) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim()).slice(0, 6) : fallback;

function mergeGeminiData(base: Service, value: GeminiPayload, checkedAt: string, sourceUrls: string[]): Service {
  const versions = Array.isArray(value.versions)
    ? value.versions.filter((item) => item && typeof item.name === "string").slice(0, 12).map((item) => ({
        name: cleanText(item.name, "Latest"),
        date: cleanText(item.date, "Unknown"),
        note: cleanText(item.note, "Release details verified with Gemini."),
      }))
    : [];
  const version = cleanText(value.version, base.version);
  const normalizedVersions = versions.some((item) => item.name === version)
    ? versions
    : [{ name: version, date: cleanText(value.releaseDate, "Unknown"), note: cleanText(value.changeSummary, "Latest verified release.") }, ...versions].slice(0, 12);
  const plans = Array.isArray(value.plans) ? value.plans.slice(0, 5).map((plan) => ({ name: cleanText(plan.name, "Plan"), price: cleanText(plan.price, "Not listed"), description: cleanText(plan.description, ""), usdAmount: typeof plan.usdAmount === "number" && Number.isFinite(plan.usdAmount) ? plan.usdAmount : null, billingUnit: cleanText(plan.billingUnit, ""), sourceUrl: cleanText(plan.sourceUrl, "") })) : [];
  const currentUsdAmount = typeof value.currentUsdAmount === "number" && Number.isFinite(value.currentUsdAmount) ? value.currentUsdAmount : null;
  const previousUsdAmount = typeof value.previousUsdAmount === "number" && Number.isFinite(value.previousUsdAmount) ? value.previousUsdAmount : null;
  const pricePercent = currentUsdAmount !== null && previousUsdAmount !== null && previousUsdAmount !== 0 ? Number((((currentUsdAmount - previousUsdAmount) / previousUsdAmount) * 100).toFixed(2)) : null;

  return {
    ...base,
    description: cleanText(value.description, base.description),
    version,
    releaseDate: cleanText(value.releaseDate, base.releaseDate),
    pricing: cleanText(value.pricing, base.pricing),
    pricingDetails: { freeTier: cleanText(value.freeTier, base.pricingDetails?.freeTier ?? "Not publicly documented"), billingNotes: cleanText(value.billingNotes, base.pricingDetails?.billingNotes ?? "Confirm final charges with the provider."), plans: plans.length ? plans : base.pricingDetails?.plans ?? [] },
    context: cleanText(value.context, base.context),
    status: cleanText(value.status, base.status),
    features: cleanList(value.features, base.features),
    versions: normalizedVersions.length ? normalizedVersions : base.versions,
    updatedAt: checkedAt,
    dataSource: "gemini",
    sourceUrls: Array.from(new Set([base.docs, base.website, value.priceSourceUrl, ...plans.map(plan => plan.sourceUrl), ...sourceUrls].filter(Boolean))).slice(0, 10),
    change: {
      previousVersion: cleanText(value.previousVersion, base.change?.previousVersion ?? "Previous snapshot"),
      previousPricing: cleanText(value.previousPricing, base.change?.previousPricing ?? "Not tracked"),
      pricePercent,
      currentUsdAmount,
      previousUsdAmount,
      effectiveDate: cleanText(value.priceEffectiveDate, ""),
      sourceUrl: cleanText(value.priceSourceUrl, ""),
      summary: cleanText(value.changeSummary, base.change?.summary ?? "Metadata refreshed with Gemini."),
      trackedAt: checkedAt,
    },
  };
}

export async function POST(request: Request) {
  let serviceId = "";
  try {
    const body = await request.json() as { serviceId?: unknown };
    serviceId = typeof body.serviceId === "string" ? body.serviceId : "";
  } catch {
    return Response.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const service = services.find((item) => item.id === serviceId);
  if (!service) return Response.json({ error: "Only catalog services can be refreshed." }, { status: 404 });

  const runtime = env as unknown as GeminiEnvironment;
  const apiKey = runtime.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Gemini refresh is not configured. Add GEMINI_API_KEY to the server environment.", code: "GEMINI_NOT_CONFIGURED" }, { status: 503 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const model = runtime.GEMINI_MODEL || "gemini-3.6-flash";
  const prompt = createEnrichmentPrompt({ service, today });

  const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }, { urlContext: {} }],
      generationConfig: {
        responseFormat: { text: { mimeType: "APPLICATION_JSON", schema: responseSchema } },
      },
    }),
  });

  if (!geminiResponse.ok) {
    await geminiResponse.text();
    const error = geminiResponse.status === 429
      ? "Live refresh is temporarily unavailable because the Gemini API quota is exhausted."
      : geminiResponse.status === 401 || geminiResponse.status === 403
        ? "Live refresh could not authenticate with Gemini. Check the server API key."
        : "Live refresh could not complete right now. Please try again shortly.";
    return Response.json({ error }, { status: 502 });
  }

  const result = await geminiResponse.json() as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }> };
    }>;
  };
  const candidate = result.candidates?.[0];
  const text = candidate?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) return Response.json({ error: "Gemini returned no structured catalog data." }, { status: 502 });

  try {
    const parsed = JSON.parse(text) as GeminiPayload;
    const sourceUrls = candidate?.groundingMetadata?.groundingChunks?.map((chunk) => chunk.web?.uri).filter((url): url is string => Boolean(url)) ?? [];
    const checkedAt = new Date().toISOString();
    return Response.json({ data: mergeGeminiData(service, parsed, checkedAt, sourceUrls), refreshedAt: checkedAt, model });
  } catch {
    return Response.json({ error: "Gemini returned an unreadable catalog response." }, { status: 502 });
  }
}
