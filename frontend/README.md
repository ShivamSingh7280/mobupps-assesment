# Product Store — Frontend

React + MUI single-page client for the Product Store.

See [`docs/DESIGN.md`](docs/DESIGN.md) for auth/session handling, folder structure rationale, and the testing approach. The API it talks to is documented in [`../backend/docs/DESIGN.md`](../backend/docs/DESIGN.md) and [`../backend/docs/openapi.yaml`](../backend/docs/openapi.yaml).

For the API server, see [`../backend/README.md`](../backend/README.md) — it must be running for this app to work.

## Prerequisites

- Node.js 20+
- The backend API running (see [`../backend/README.md`](../backend/README.md))

## Run locally

```bash
cp .env.example .env     # defaults to http://localhost:5000/api/v1, override if needed
npm install
npm run dev               # http://localhost:5173
```

Open `http://localhost:5173`, register an account, and start managing products.

### Environment variables

See [`.env.example`](.env.example):

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL (default `http://localhost:5000/api/v1`) |

## Folder structure

```
frontend/
├── src/
│   ├── api/           # axios instance + per-resource API modules
│   ├── components/    # common/, products/, auth/
│   ├── context/       # AuthContext
│   ├── hooks/         # useDebounce, useProducts, useProductMutations, useCloudinaryUpload, useAuth
│   ├── pages/         # LoginPage, RegisterPage, ProductsPage, NotFoundPage
│   ├── routes/        # AppRouter, ProtectedRoute
│   └── theme/         # MUI theme
└── docs/
    └── DESIGN.md       # frontend design document
```

## Testing

```bash
npm test   # Vitest + React Testing Library + MSW — 24 tests
```

## Scripts reference

| Script | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm test` | Run the Vitest test suite |
