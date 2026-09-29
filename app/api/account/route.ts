import { and, eq, notInArray } from "drizzle-orm";
import { ensureUserSchema, getDb } from "../../../db";
import { users, userSavedServices, userWorkspaces } from "../../../db/schema";
import { getCurrentUser } from "../../neon-auth";
import { services as catalogServices, type Service } from "../../data";

type WorkspacePayload = {
  savedServices: string[];
  comparisonSelections: string[];
  researchedServices: Service[];
  readAlerts: string[];
  mutedServices: string[];
  theme: "light" | "dark";
  savedLayout: "grid" | "list";
};

const emptyWorkspace: WorkspacePayload = {
  savedServices: [],
  comparisonSelections: [],
  researchedServices: [],
  readAlerts: [],
  mutedServices: [],
  theme: "light",
  savedLayout: "grid",
};

function cleanStrings(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0 && item.length <= 200))).slice(0, limit);
}

function cleanServices(value: unknown): Service[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Service => Boolean(item && typeof item === "object" && typeof item.id === "string" && typeof item.name === "string"))
    .slice(0, 50);
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function serializeWorkspace(row: typeof userWorkspaces.$inferSelect | undefined): WorkspacePayload {
  if (!row) return emptyWorkspace;
  return {
    savedServices: cleanStrings(parseJson(row.savedServices, []), 500),
    comparisonSelections: cleanStrings(parseJson(row.comparisonSelections, []), 3),
    researchedServices: cleanServices(parseJson(row.researchedServices, [])),
    readAlerts: cleanStrings(parseJson(row.readAlerts, []), 1000),
    mutedServices: cleanStrings(parseJson(row.mutedServices, []), 500),
    theme: row.theme === "dark" ? "dark" : "light",
    savedLayout: row.savedLayout === "list" ? "list" : "grid",
  };
}

function workspaceFromPayload(value: unknown): WorkspacePayload {
  const payload = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    savedServices: cleanStrings(payload.savedServices, 500),
    comparisonSelections: cleanStrings(payload.comparisonSelections, 3),
    researchedServices: cleanServices(payload.researchedServices),
    readAlerts: cleanStrings(payload.readAlerts, 1000),
    mutedServices: cleanStrings(payload.mutedServices, 500),
    theme: payload.theme === "dark" ? "dark" : "light",
    savedLayout: payload.savedLayout === "list" ? "list" : "grid",
  };
}

async function currentAccount() {
  const identity = await getCurrentUser();
  if (!identity) return null;

  await ensureUserSchema();
  const db = getDb();
  const now = new Date().toISOString();
  await db.insert(users).values({
    id: identity.id,
    authUserId: identity.id,
    email: identity.email.toLowerCase(),
    displayName: identity.displayName,
    fullName: identity.fullName,
    lastLoginAt: now,
  }).onConflictDoUpdate({
    target: users.email,
    set: { authUserId: identity.id, displayName: identity.displayName, fullName: identity.fullName, lastLoginAt: now },
  });

  const [user] = await db.select().from(users).where(eq(users.email, identity.email.toLowerCase())).limit(1);
  return user ? { db, user } : null;
}

export async function GET() {
  try {
    const account = await currentAccount();
    if (!account) return Response.json({ error: "Sign in to load your workspace." }, { status: 401 });

    const [workspace] = await account.db.select().from(userWorkspaces).where(eq(userWorkspaces.userId, account.user.id)).limit(1);
    const savedRows = await account.db.select().from(userSavedServices).where(eq(userSavedServices.userId, account.user.id));
    const serialized = serializeWorkspace(workspace);
    const savedServiceDetails = savedRows.map((row) => parseJson<Service | null>(row.serviceSnapshot, null)).filter((service): service is Service => Boolean(service));
    return Response.json({
      user: {
        displayName: account.user.displayName,
        email: account.user.email,
        fullName: account.user.fullName,
        lastLoginAt: account.user.lastLoginAt,
      },
      workspace: { ...serialized, savedServices: savedRows.length ? savedRows.map((row) => row.serviceId) : serialized.savedServices },
      savedServiceDetails,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load the workspace." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const account = await currentAccount();
    if (!account) return Response.json({ error: "Sign in to save your workspace." }, { status: 401 });

    const workspace = workspaceFromPayload(await request.json());
    const now = new Date().toISOString();
    const values = {
      savedServices: JSON.stringify(workspace.savedServices),
      comparisonSelections: JSON.stringify(workspace.comparisonSelections),
      researchedServices: JSON.stringify(workspace.researchedServices),
      readAlerts: JSON.stringify(workspace.readAlerts),
      mutedServices: JSON.stringify(workspace.mutedServices),
      theme: workspace.theme,
      savedLayout: workspace.savedLayout,
      updatedAt: now,
    };

    await account.db.insert(userWorkspaces).values({ userId: account.user.id, ...values }).onConflictDoUpdate({
      target: userWorkspaces.userId,
      set: values,
    });

    const existingRows = await account.db.select().from(userSavedServices).where(eq(userSavedServices.userId, account.user.id));
    const existingSnapshots = new Map(existingRows.map((row) => [row.serviceId, parseJson<Service | null>(row.serviceSnapshot, null)]));
    const availableServices = new Map([...catalogServices, ...workspace.researchedServices].map((service) => [service.id, service]));

    for (const serviceId of workspace.savedServices) {
      const service = availableServices.get(serviceId) ?? existingSnapshots.get(serviceId);
      if (!service) continue;
      await account.db.insert(userSavedServices).values({
        userId: account.user.id,
        serviceId: service.id,
        name: service.name,
        provider: service.provider,
        category: service.category,
        serviceSnapshot: JSON.stringify(service),
        updatedAt: now,
      }).onConflictDoUpdate({
        target: [userSavedServices.userId, userSavedServices.serviceId],
        set: {
          name: service.name,
          provider: service.provider,
          category: service.category,
          serviceSnapshot: JSON.stringify(service),
          updatedAt: now,
        },
      });
    }

    if (workspace.savedServices.length) {
      await account.db.delete(userSavedServices).where(and(
        eq(userSavedServices.userId, account.user.id),
        notInArray(userSavedServices.serviceId, workspace.savedServices),
      ));
    } else {
      await account.db.delete(userSavedServices).where(eq(userSavedServices.userId, account.user.id));
    }

    const savedServiceDetails = workspace.savedServices.map((serviceId) => availableServices.get(serviceId) ?? existingSnapshots.get(serviceId)).filter((service): service is Service => Boolean(service));
    return Response.json({ workspace, savedServiceDetails, savedAt: now });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save the workspace." }, { status: 500 });
  }
}
