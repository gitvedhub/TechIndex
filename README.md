# TechIndex

TechIndex is a developer intelligence dashboard for discovering, researching, tracking, saving, and comparing modern software services. Gemini produces grounded catalog profiles from official sources, while Neon PostgreSQL keeps signed-in user workspaces synchronized across sessions.

## Included

- Searchable service catalog and category filters
- Personal workspace with an add-service flow
- Gemini-powered live research with official-source citations
- Signed-in workspaces persisted in Neon PostgreSQL
- Favorites, comparisons, alerts, custom research, and preferences
- Detailed service profiles, capabilities, pricing, and release history
- Side-by-side comparison for up to three services
- CSV export and `Ctrl/Cmd + K` search shortcut
- Responsive desktop, tablet, and mobile layouts
- JSON API routes for the catalog, latest services, search, and service details

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run db:push
npm run dev
```

Open `http://localhost:3000`.

Create `.dev.vars` for local server secrets:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NEON_AUTH_BASE_URL=https://your-project.neon.tech
NEON_AUTH_COOKIE_SECRET=generate-a-random-secret-with-at-least-32-characters
```

Do not commit `.dev.vars` or any database credentials. Configure the same five variables in the hosted runtime. Copy the Auth URL from the Neon Console's Auth page; it is separate from the PostgreSQL connection string.

## Validate

```bash
npm run lint
npm run build
```

When the database model changes, generate and apply the PostgreSQL migration:

```bash
npm run db:generate
npm run db:push
```

## API

- `GET /api/services`
- `GET /api/services?q=redis`
- `GET /api/services/latest`
- `GET /api/services/:id`
- `POST /api/services/search`
- `POST /api/services/enrich`
- `GET /api/account`
- `PUT /api/account`

The bundled baseline catalog lives in `app/data.ts`. Live search and enrichment call Gemini only from server routes, so the API key is never exposed to the browser. Neon Auth provides email/password sessions, and protected account routes link the Neon Auth user ID to the profile, workspace, and full starred-service snapshots stored in Neon PostgreSQL.
