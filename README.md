# 🚀 Auth + Posts API (Node/Express + Mongo + React)

## 📌 Overview
JWT-authenticated REST API with role-based access (user/admin) and simple posts CRUD for admins. Includes Swagger docs and a minimal React (Vite) frontend for exercising the flows.

---

## ⚙️ Tech Stack
### Backend
- Node.js / Express.js
- MongoDB / Mongoose
- JWT for auth, bcrypt for password hashing
- Swagger (swagger-ui-express, swagger-jsdoc)

### Frontend
- React (Vite)
- Fetch-based API calls (env: `VITE_API_BASE`)

---

## 🔑 Features
- User signup/login with hashed passwords and JWT issuance
- Role-based access (user, admin)
- Admin CRUD for posts; public read-only posts endpoint
- Swagger UI for live API exploration

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/signup` — create user/admin (admin requires `inviteCode`)
- `POST /api/auth/login` — login, receive JWT
- `GET /api/auth/me` — current token payload (auth required)

### Posts
- `GET /api/posts` — public list of posts
- `GET /api/admin/posts` — list posts (admin, auth required)
- `POST /api/admin/posts` — create post (admin, auth required)
- `PUT /api/admin/posts/:id` — update post (admin, auth required)
- `DELETE /api/admin/posts/:id` — delete post (admin, auth required)

### Other
- `GET /api/admin/summary` — simple admin-only check
- `GET /health` — health probe
- Swagger UI: `http://localhost:3001/api/docs` (JSON: `/api/docs.json`)

---

## ⚙️ Setup & Run (with MongoDB)

### Prerequisites
- Node.js 18+ recommended
- MongoDB running locally (`mongodb://localhost:27017/auth-demo`) or a connection string of your choice

### 1) Clone
```bash
git clone https://github.com/codemanav16/CURD-assignment
cd CURD-assignment


### 2) Backend
```bash
cd backend
npm install
```

Create `.env` in `backend` (values shown with safe defaults):
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/auth-demo
JWT_SECRET=change-me
ADMIN_INVITE_CODE=admin-code
SWAGGER_SERVER_URL=http://localhost:3001
```

Start the API:
```bash
npm start
```

Swagger will be available at `http://localhost:3001/api/docs` once the server is running.

### 3) Frontend
```bash
cd ../frontend
npm install
# point to your backend if not localhost:3001
echo VITE_API_BASE=http://localhost:3001 > .env.local
npm run dev
```

Open the printed Vite dev URL (defaults to `http://localhost:5173`).

---

## 🔒 Auth Flow Notes
- Store the returned JWT in `localStorage` (frontend already does this) and send it as `Authorization: Bearer <token>` for protected endpoints.
- Admin signup requires the `ADMIN_INVITE_CODE` value.


## 📂 Structure (high level)
- `backend/` Express app with Mongo models and auth/posts routes
- `frontend/` Vite React UI hitting the API

## 🌐 Deployed Link
- Frontend (Vercel): https://curd-assignment-ecru.vercel.app/
