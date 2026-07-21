# Design Document — Product Store Client

This document covers frontend-specific design points: auth/session handling, folder structure rationale, and the testing approach. For the API contract this client consumes, see [`backend/docs/DESIGN.md`](../../backend/docs/DESIGN.md) and the OpenAPI spec at [`backend/docs/openapi.yaml`](../../backend/docs/openapi.yaml). For setup/run instructions, see the [frontend README](../README.md).

## 1. Auth and Session Handling

- **Access token storage**: kept in memory only (React context), never `localStorage`/`sessionStorage` and never a JS-readable cookie — limits what an XSS payload could exfiltrate. This means the token does not survive a full page reload by itself.
- **Silent session restore**: on app load, `AuthContext` calls `POST /auth/refresh` once before rendering protected routes. The `httpOnly` refresh cookie set by the backend on login/register is sent automatically by the browser, so a page refresh doesn't force a re-login as long as that cookie is still valid.
- **Axios interceptor**: a response interceptor detects a `401` from an expired access token, transparently calls `/auth/refresh`, and retries the original request once with the new token — the user never sees a failed request due to normal token expiry.
- **Protected routes**: `routes/ProtectedRoute` gates any route that requires an authenticated user, redirecting to `/login` if `AuthContext` has no current user after the initial restore attempt resolves.

## 2. Folder Structure

```
frontend/
└── src/
    ├── api/           # axios instance + per-resource API modules
    ├── components/    # common/, products/, auth/
    ├── context/       # AuthContext
    ├── hooks/         # useDebounce, useProducts, useProductMutations, useCloudinaryUpload, useAuth
    ├── pages/         # LoginPage, RegisterPage, ProductsPage, NotFoundPage
    ├── routes/        # AppRouter, ProtectedRoute
    └── theme/         # MUI theme
```

- **`api/`** wraps every backend call so components never construct URLs or headers directly; the shared axios instance owns the base URL, credentials mode, and the refresh interceptor described above.
- **`hooks/`** isolates data-fetching and mutation logic (React Query) from presentation, and `useDebounce` keeps the search box from firing a request per keystroke.
- Validation rules mirror the backend's Zod schemas (via React Hook Form + Zod) for instant feedback, but are never trusted as the source of truth — the server re-validates everything.

## 3. Testing

Vitest + React Testing Library + MSW (`frontend/src/**/*.test.jsx`):
- Component tests for `ProductCard`, `PaginationBar`, `SearchBar`, and `ProtectedRoute`.
- An integration suite drives the real `ProductsPage` component tree (React Query + Router + Auth context) against an MSW-mocked backend — load, debounced search, empty state, and add-product validation/success.

Run with `npm test` inside `frontend/`.
