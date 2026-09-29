# TechIndex

A developer intelligence dashboard for discovering, researching, saving, and comparing software services. TechIndex combines a searchable catalog with Gemini-powered research and personal workspaces backed by Neon PostgreSQL.

## Features

- Browse services by category and search the catalog.
- Research services with Gemini and review official-source citations.
- Compare up to three services or releases side by side.
- Save favorites, service profiles, research history, and preferences.
- Sign in with email and password through Neon Auth.
- Review pricing, capabilities, release history, and tracked updates.
- Export saved services as CSV.
- Navigate a responsive dashboard with a `Ctrl/Cmd + K` search shortcut.

The bundled catalog is a baseline snapshot, not a guarantee of current pricing or availability. Check the linked official sources when making decisions.

## Technology

| Layer | Tools |
| --- | --- |
| Interface | React 19, TypeScript, Next.js App Router conventions |
| Development and build | vinext, Vite, Tailwind CSS |
| Runtime | Cloudflare Workers |
| Database | Neon PostgreSQL, Drizzle ORM |
| Authentication | Neon Auth |
| Research | Gemini API |

## Getting started

### 1. Install dependencies

Use Node.js **22.13 or newer** and npm.

```bash
git clone https://github.com/gitvedhub/TechIndex.git
cd TechIndex
npm ci
```

### 2. Configure local services

For all features, configure a Neon PostgreSQL database, Neon Auth, and a Gemini API key. Create a `.dev.vars` file in the project root using your own values:

```dotenv
GEMINI_API_KEY=replace-with-your-gemini-api-key
GEMINI_MODEL=replace-with-your-enabled-gemini-model
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
NEON_AUTH_BASE_URL=https://YOUR-NEON-AUTH-ENDPOINT
NEON_AUTH_COOKIE_SECRET=replace-with-a-random-secret-at-least-32-characters-long
```

All values above are placeholders. Copy the authentication endpoint from your Neon Auth configuration; it is different from the database connection string.

Generate a random cookie secret locally:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Authenticate server-side research requests |
| `GEMINI_MODEL` | Select a Gemini model available to your project |
| `DATABASE_URL` | Connect to Neon PostgreSQL |
| `NEON_AUTH_BASE_URL` | Connect to your Neon Auth service |
| `NEON_AUTH_COOKIE_SECRET` | Protect authentication cookies |

### 3. Prepare the database

Drizzle reads `DATABASE_URL` from the shell environment. The configuration does not load `.dev.vars` into the Drizzle CLI automatically. Set the same database URL in your terminal before applying the schema.

PowerShell:

```powershell
$env:DATABASE_URL = 'postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require'
npm run db:push
```

Bash:

```bash
export DATABASE_URL='postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require'
npm run db:push
```

Use your intended development database: `db:push` applies schema changes to the configured database.

### 4. Start the app

```bash
npm run dev
```

Open the local URL printed by the development server.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the application |
| `npm start` | Run the configured vinext start command |
| `npm run lint` | Check application and configuration code with ESLint |
| `npm run db:generate` | Generate migrations from the Drizzle schema |
| `npm run db:push` | Apply the schema to the configured PostgreSQL database |

## Project structure

```text
app/                 Pages, dashboard components, styles, and API routes
  account/           Personal workspace
  api/               Catalog, research, authentication, and account endpoints
  login/             Email and password authentication UI
  data.ts            Bundled catalog snapshot
  tech-index.tsx     Main dashboard
build/               Build integration helpers
db/                 Database client and application schema
drizzle-neon/       PostgreSQL migrations and schema snapshots
examples/d1/        Example D1 integration
public/             Static assets
worker/             Cloudflare Worker entry point
```

The active Drizzle configuration uses `db/schema.ts` and writes PostgreSQL migrations to `drizzle-neon/`.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/services` | List catalog services; accepts a `q` search parameter |
| GET | `/api/services/:id` | Retrieve a service profile |
| GET | `/api/services/latest` | Retrieve latest-service data |
| POST | `/api/services/search` | Research services with Gemini |
| POST | `/api/services/enrich` | Refresh service information with Gemini |
| GET | `/api/account` | Read the signed-in user's workspace |
| PUT | `/api/account` | Update the signed-in user's workspace |

Account endpoints require authentication. Research features require server-side Gemini configuration.

## Secrets and configuration

Keep real credentials in `.dev.vars` locally and configure them as server-side secrets in your hosted runtime. Do not paste them into source files, screenshots, issues, or commits.

The repository's `.gitignore` excludes `.dev.vars`, `.env*`, private key files, dependency folders, and local build caches. API routes read the Gemini key from the server environment. Neon Auth handles password authentication and sessions.

## Troubleshooting

- **Research is unavailable:** check the Gemini API key and model configured in the server environment.
- **Sign-in fails:** check the Neon Auth endpoint and cookie secret.
- **Workspace data is unavailable:** check the database connection and schema.
- **Drizzle connects to localhost:** export `DATABASE_URL` in the terminal running the database command; `.dev.vars` alone is not enough for that CLI.

After changing local environment configuration, restart the development server.
