type FrankfurterRate = { date?: string; base?: string; quote?: string; rate?: number };

export async function GET() {
  try {
    const response = await fetch("https://api.frankfurter.dev/v2/rate/USD/INR", {
      headers: { accept: "application/json" },
      cf: { cacheTtl: 21600, cacheEverything: true },
    } as RequestInit & { cf: { cacheTtl: number; cacheEverything: boolean } });
    if (!response.ok) throw new Error(`FX provider returned ${response.status}`);
    const value = await response.json() as FrankfurterRate;
    if (typeof value.rate !== "number" || !Number.isFinite(value.rate)) throw new Error("Invalid FX response");
    return Response.json({ base: "USD", quote: "INR", rate: value.rate, date: value.date ?? new Date().toISOString().slice(0, 10), source: "Frankfurter institutional reference rate" }, { headers: { "cache-control": "public, max-age=3600, s-maxage=21600" } });
  } catch {
    return Response.json({ error: "The USD/INR reference rate is temporarily unavailable." }, { status: 503 });
  }
}
