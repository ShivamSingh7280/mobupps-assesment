# Design Document — Product Store API

This document covers the required design points for the assignment: API structure, authentication, request/response shapes, validation, example requests, trade-offs, and the backend testing approach. For setup/run instructions, see the [backend README](../README.md).

## 1. API Structure and Endpoints

All routes are prefixed `/api/v1` and served by the Express app in `backend/`. **Every route below requires a valid JWT access token**, except the three explicitly marked public — this was a deliberate scope decision (see [§6 Trade-offs](#6-trade-offs-and-assumptions)): the catalog is not publicly browsable, matching the assessment's literal "add/edit/delete/**view** products" requirement.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Create a user account |
| POST | `/auth/login` | public | Authenticate with email/password |
| POST | `/auth/refresh` | public* | Exchange a valid refresh cookie for a new access token |
| POST | `/auth/logout` | JWT | Revoke the current session |
| GET | `/auth/me` | JWT | Current user's profile |
| GET | `/products` | JWT | Paginated, searchable product list |
| GET | `/products/:id` | JWT | Single product |
| POST | `/products` | JWT | Create a product |
| PUT | `/products/:id` | JWT | Update a product (partial) |
| DELETE | `/products/:id` | JWT | Delete a product |
| POST | `/uploads/signature` | JWT | Get a signed Cloudinary upload signature |
| GET | `/health` | public | Liveness probe (outside `/api/v1`) |

*`/auth/refresh` doesn't require a bearer token (the access token is presumed expired) but does require the `httpOnly` refresh cookie set by login/register — it isn't open to arbitrary callers.

Interactive documentation: once the backend is running, browse to `http://localhost:5000/api-docs` for a live Swagger UI generated from [`openapi.yaml`](openapi.yaml). A ready-to-import Postman collection is also provided at [`postman_collection.json`](postman_collection.json).

## 2. Authentication Mechanism

- **Password storage**: bcrypt, cost factor 12.
- **Access token**: JWT, 15-minute expiry, signed with `JWT_ACCESS_SECRET`. Returned in the JSON response body only — the frontend keeps it in memory (never `localStorage`, never a JS-readable cookie), which limits what an XSS payload could exfiltrate.
- **Refresh token**: a random 40-byte token, 7-day expiry, sent as an `httpOnly`, `Secure` (in production), `SameSite=Strict` cookie scoped to the `/api/v1/auth` path. The raw token is never stored server-side — only its SHA-256 hash, in the `refresh_tokens` table.
- **Rotation**: every successful `/auth/refresh` issues a new refresh token and immediately revokes the one that was just used. If a revoked token is presented again (a strong signal of theft/replay), the server revokes **every** active session for that user, not just the one token.
- **Silent session restore**: on page load, the frontend calls `/auth/refresh` once before rendering protected content, so a browser refresh doesn't force a re-login as long as the refresh cookie is still valid.
- **Authorization model**: a single global rule — a valid, unexpired access token is required, full stop. There is no per-resource ownership check: any authenticated user may create, edit, or delete any product (a "shared catalog" model, see trade-offs). `created_by` is recorded on each product for audit purposes only.

## 3. Request/Response Structure

Every response follows one consistent envelope:

```json
// success
{
  "success": true,
  "data": { "...": "..." },
  "meta": { "page": 1, "limit": 12, "total": 57, "totalPages": 5 }
}
```

```json
// failure
{
  "success": false,
  "message": "Product not found",
  "errors": [
    { "field": "price", "message": "must be >= 0" }
  ]
}
```

`meta` is present only on the paginated products list. `errors` is present only on validation failures (HTTP 400) and contains one entry per invalid field.

**Standard status codes used throughout:** `200` success, `201` created, `400` validation error, `401` missing/invalid/expired token, `403` — reserved, unused in the current shared-catalog model, `404` not found, `409` conflict (duplicate email), `500` unexpected/infrastructure error (DB or Cloudinary failure, never exposes internals to the client).

## 4. Data Assumptions and Validations

### Users
| Field | Rule |
|---|---|
| `name` | 2–100 characters |
| `email` | valid email format, unique, case-normalized to lowercase |
| `password` | 8–72 characters (72 = bcrypt's input limit) |

### Products
| Field | Rule |
|---|---|
| `name` | 2–150 characters, required |
| `description` | up to 2000 characters, optional |
| `price` | numeric, ≥ 0, required |
| `stock_quantity` | integer, ≥ 0, defaults to 0 |
| `image_url` / `image_public_id` | optional — a product may be created without an image |

Every rule above is enforced **twice**: once client-side (React Hook Form + Zod, for instant feedback) and once server-side (Zod middleware, the actual source of truth — the API never trusts the client). A `PUT` with zero fields is rejected outright rather than silently "succeeding" at nothing.

**Assumptions made** (not specified by the assignment, decided for a coherent v1 scope):
- Single shared product catalog — not a multi-tenant/multi-seller marketplace.
- No product categories, tags, or price-range filtering — search is by name/description substring only.
- Images are optional on products.
- Every authenticated user has equal privileges (no admin/regular-user role split).

## 5. Example Usage Scenarios

Base URL: `http://localhost:5000/api/v1`. The `Set-Cookie: refreshToken=...` header returned by register/login must be preserved across requests (a browser or Postman does this automatically; the `-c`/`-b` flags below do it for `curl`).

**Register**
```bash
curl -i -c cookies.txt -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"password123"}'
```

**Login**
```bash
curl -i -c cookies.txt -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"password123"}'
```
Response includes `data.accessToken` — copy it for the requests below.

**List products (paginated, searched)**
```bash
curl -s "http://localhost:5000/api/v1/products?page=1&limit=12&search=sneaker" \
  -H "Authorization: Bearer <accessToken>"
```

**Create a product**
```bash
curl -s -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nike Air Max 270","description":"Comfortable everyday sneaker","price":139.99,"stock_quantity":12}'
```

**Update a product**
```bash
curl -s -X PUT http://localhost:5000/api/v1/products/<id> \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"price":129.99}'
```

**Delete a product**
```bash
curl -s -X DELETE http://localhost:5000/api/v1/products/<id> \
  -H "Authorization: Bearer <accessToken>"
```

**Refresh the session (uses the cookie, not the old access token)**
```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:5000/api/v1/auth/refresh
```

**Get an image-upload signature, then upload directly to Cloudinary**
```bash
curl -s -X POST http://localhost:5000/api/v1/uploads/signature -H "Authorization: Bearer <accessToken>"
# -> { timestamp, signature, folder, apiKey, cloudName }
curl -s -X POST "https://api.cloudinary.com/v1_1/<cloudName>/image/upload" \
  -F "file=@photo.jpg" -F "api_key=<apiKey>" -F "timestamp=<timestamp>" \
  -F "signature=<signature>" -F "folder=<folder>"
# -> use the returned secure_url / public_id as image_url / image_public_id when creating/updating a product
```

A full, importable version of these requests (with variables for the base URL and tokens) is in [`postman_collection.json`](postman_collection.json).

## 6. Trade-offs and Assumptions

These were explicit scope decisions, each made for a stated reason — not oversights:

- **Fully protected reads vs. public browsing**: chosen to match the assessment's literal wording over the more typical e-commerce pattern of public browsing. Trade-off: an anonymous mobile client can't show a catalog preview without a login screen first.
- **Shared catalog, no per-product ownership**: simpler schema and authorization logic; any authenticated user can edit/delete any product. Appropriate for an internal admin-style tool, not a multi-vendor marketplace.
- **No categories/price-range filtering/sorting**: search is name/description substring only, via Postgres `pg_trgm` + `ILIKE`. Kept the query surface (and the validation/testing surface) small and correct rather than broad and half-tested.
- **Client-side direct-to-Cloudinary upload** (via a signed signature) instead of proxying the image binary through the Express server: better scalability (no multipart streaming/memory pressure on the API), at the cost of a slightly more involved upload flow (two hops: get signature, then upload).
- **Cloudinary cleanup is best-effort**: deleting/replacing a product's image tries to delete the old Cloudinary asset, but a Cloudinary-side failure only gets logged, never blocks the database operation that already succeeded. Accepted trade-off: an occasional orphaned image asset is a far smaller problem than a stuck request or an inconsistent product row.
- **Concurrent edits use last-write-wins**: two users editing the same product at once — the second `PUT` silently overwrites the first. No optimistic-concurrency (`If-Match`/version column) check was implemented; documented here as a known gap rather than solved, since it's outside the assignment's stated scope.
- **Refresh-reuse detection revokes all sessions for that user**, not just the reused token — a stronger response to a likely-theft signal, at the cost of logging out every device if a rotation race ever produces a false positive (e.g., two tabs refreshing at the exact same instant). Considered an acceptable trade for the security benefit.

## 7. Testing

Backend tests use Jest + Supertest (`backend/tests/`): unit tests mock only the Supabase client boundary, so validation, auth middleware, and actual service logic (including the search-sanitizer and the image-cleanup branches) run for real. Integration tests exercise the full Express middleware chain — auth guard, 400s on bad input, 401s on missing/invalid tokens, 404s, and the happy paths for every CRUD route.

Run with `npm test` inside `backend/`.

For frontend testing, see [`frontend/docs/DESIGN.md`](../../frontend/docs/DESIGN.md).
