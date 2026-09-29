import { getNeonAuth } from "../../../neon-auth";

type RouteContext = { params: Promise<{ path: string[] }> };

function unavailable(error: unknown) {
  return Response.json({ error: error instanceof Error ? error.message : "Neon Auth is unavailable." }, { status: 503 });
}

export async function GET(request: Request, context: RouteContext) {
  try { return await getNeonAuth().handler().GET(request, context); } catch (error) { return unavailable(error); }
}

export async function POST(request: Request, context: RouteContext) {
  try { return await getNeonAuth().handler().POST(request, context); } catch (error) { return unavailable(error); }
}

export async function PUT(request: Request, context: RouteContext) {
  try { return await getNeonAuth().handler().PUT(request, context); } catch (error) { return unavailable(error); }
}

export async function DELETE(request: Request, context: RouteContext) {
  try { return await getNeonAuth().handler().DELETE(request, context); } catch (error) { return unavailable(error); }
}

export async function PATCH(request: Request, context: RouteContext) {
  try { return await getNeonAuth().handler().PATCH(request, context); } catch (error) { return unavailable(error); }
}
