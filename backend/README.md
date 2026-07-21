# Product Store — Backend

Node.js + Express REST API for the Product Store (Supabase/Postgres, Cloudinary, JWT auth).

See [`docs/DESIGN.md`](docs/DESIGN.md) for API structure, auth mechanism, validation rules, sample requests, and documented trade-offs. See [`docs/openapi.yaml`](docs/openapi.yaml) (also served live at `/api-docs`) and [`docs/postman_collection.json`](docs/postman_collection.json) for the full API reference.

For the client app, see [`../frontend/README.md`](../frontend/README.md).

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier is fine) — used for the Postgres database
- A [Cloudinary](https://cloudinary.com) account (free tier is fine) — used for product image storage

## 1. Set up the database

1. Create a Supabase project and open its **SQL Editor**.
2. Paste in the contents of [`src/db/schema.sql`](src/db/schema.sql) and run it. It's idempotent — safe to re-run.
3. From your Supabase project's **Settings → API**, note down the **Project URL** and the **`service_role` secret key** (not the `anon` key — the backend needs the service role key since it bypasses Row Level Security, which this schema enables with no policies as defense-in-depth against the `anon`/public API).

## 2. Set up Cloudinary

From your Cloudinary dashboard, note down the **Cloud name**, **API Key**, and **API Secret**. No manual bucket/preset configuration is needed — the backend generates signed, scoped upload signatures on demand (see [`docs/DESIGN.md`](docs/DESIGN.md#2-authentication-mechanism)).

## 3. Run locally

```bash
cp .env.example .env    # fill in SUPABASE_*, CLOUDINARY_*, and a strong JWT_ACCESS_SECRET
npm install
npm run dev              # http://localhost:5000
```

Interactive API docs are served at `http://localhost:5000/api-docs` whenever the backend is running.

### Environment variables

See [`.env.example`](.env.example):

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `5000`) |
| `CLIENT_ORIGIN` | Comma-separated frontend origins allowed by CORS (default `http://localhost:5173,https://mobupps-assesment.vercel.app`) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only, never expose to the client) |
| `JWT_ACCESS_SECRET` | Strong random secret used to sign access tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime (default `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime (default `7d`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials |

## Folder structure

```
backend/
├── src/
│   ├── config/       # env validation, Supabase client, Cloudinary client
│   ├── controllers/  # thin HTTP handlers
│   ├── routes/       # route wiring + middleware composition
│   ├── services/     # business logic + Supabase queries
│   ├── middleware/   # auth, validation, rate limiting, error handling
│   ├── validators/   # Zod schemas
│   ├── utils/        # ApiError, ApiResponse, asyncHandler, logger, token helpers
│   └── db/           # schema.sql
├── tests/            # Jest unit + integration tests
└── docs/
    ├── DESIGN.md              # required design document
    ├── openapi.yaml           # OpenAPI 3.0 spec (also served live at /api-docs)
    └── postman_collection.json
```

## Testing

```bash
npm test    # Jest + Supertest — 68 tests
```

## Scripts reference

| Script | What it does |
|---|---|
| `npm run dev` | Start the API with hot reload (nodemon) |
| `npm start` | Start the API (production) |
| `npm test` | Run the Jest test suite |
