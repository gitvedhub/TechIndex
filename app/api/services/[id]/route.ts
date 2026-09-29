import { services } from "../../../data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = services.find((item) => item.id === id);
  return service ? Response.json({ data: service }) : Response.json({ error: "Service not found" }, { status: 404 });
}
