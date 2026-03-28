# Backend

Express + MongoDB API with JWT auth and role-based access (`admin`, `user`).

## Scripts

- `npm run dev` — start with nodemon on port 3001 (or `PORT`).
- `npm start` — start with node.
- `npm run lint` — run ESLint.

## Env vars

- `MONGODB_URI` — Mongo connection string (required for real usage).
- `JWT_SECRET` — secret for signing JWTs (required for production).
- `ADMIN_INVITE_CODE` — passcode needed to create admin users (defaults to `admin-code`).
- `PORT` — server port (default `3001`).

Create a `.env` file:

```
MONGODB_URI=mongodb://127.0.0.1:27017/auth-demo
JWT_SECRET=replace-me
ADMIN_INVITE_CODE=admin-code
PORT=3001
```

## Endpoints

- `GET /health` → `{ status: "ok", service: "backend" }`
- `POST /api/auth/signup` → `{ token, user, redirect }` (role defaults to `user`; provide `role: "admin"` and `inviteCode` to create admin)
- `POST /api/auth/login` → `{ token, user, redirect }`
- `GET /api/auth/me` (Bearer token) → current user claims
- `GET /api/admin/summary` (admin only) → sample protected resource

`redirect` indicates where the client should route (`/admin` for admins, `/home` for users).

## Setup

```bash
npm install
npm run dev
```

Attach an Authorization header `Bearer <token>` for protected routes.
