import { services } from "../../../data";

export async function GET() {
  return Response.json({ data: services.slice().sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, 5) });
}
