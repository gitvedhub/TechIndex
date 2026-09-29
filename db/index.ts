import { env } from "cloudflare:workers";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let schemaReady: Promise<void> | undefined;
let sqlClient: NeonQueryFunction<false, false> | undefined;

type DatabaseEnvironment = { DATABASE_URL?: string };

function getSqlClient() {
  const databaseUrl = (env as unknown as DatabaseEnvironment).DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Neon is unavailable. Add DATABASE_URL to the server environment.");
  }

  sqlClient ??= neon(databaseUrl);
  return sqlClient;
}

export function ensureUserSchema() {
  if (!schemaReady) {
    const sql = getSqlClient();
    schemaReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY NOT NULL,
        auth_user_id text UNIQUE,
        email text NOT NULL UNIQUE,
        display_name text NOT NULL,
        full_name text,
        created_at timestamptz NOT NULL DEFAULT now(),
        last_login_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id text`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_auth_user_id_unique ON users (auth_user_id)`;
      await sql`CREATE TABLE IF NOT EXISTS user_workspaces (
        user_id text PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        saved_services text NOT NULL DEFAULT '[]',
        comparison_selections text NOT NULL DEFAULT '[]',
        researched_services text NOT NULL DEFAULT '[]',
        read_alerts text NOT NULL DEFAULT '[]',
        muted_services text NOT NULL DEFAULT '[]',
        theme text NOT NULL DEFAULT 'light',
        saved_layout text NOT NULL DEFAULT 'grid',
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS user_saved_services (
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        service_id text NOT NULL,
        name text NOT NULL,
        provider text NOT NULL,
        category text NOT NULL,
        service_snapshot text NOT NULL,
        saved_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, service_id)
      )`;
    })().catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  return schemaReady;
}

export function getDb() {
  return drizzle(getSqlClient(), { schema });
}
