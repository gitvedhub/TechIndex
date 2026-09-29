import { services } from "../../data";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.toLowerCase();
  const data = query
    ? services.filter((service) => `${service.name} ${service.category} ${service.description}`.toLowerCase().includes(query))
    : services;
  return Response.json({ data, total: data.length, refreshedAt: new Date().toISOString() });
}
