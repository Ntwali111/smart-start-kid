# Smart Start Kids

Financial literacy app for children, with parent and facilitator dashboards. This repo is a personal project (no collaborators).

## What you need

- [Node.js](https://nodejs.org/) **v18 or newer** (includes `npm`)
- [Git](https://git-scm.com/) (to clone the repo)

Check versions:

```bash
node -v
npm -v
```

## Run the project locally (follow in order)

### 1. Clone the repository

```bash
git clone https://github.com/Ntwali111/smart-start-kid.git
cd smart-start-kid
```

(If your folder name is `smart-start-kids`, use that path in the commands below.)

### 2. Backend – install dependencies

```bash
cd backend
npm install
```

### 3. Backend – environment file

Create `backend/.env` (you can start from the example file):

```bash
copy .env.example .env
```

On Windows PowerShell, if `copy` fails:

```powershell
Copy-Item .env.example .env
```

Edit `backend/.env` and set at least:

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=change-this-to-a-long-random-string-in-production
DATABASE_URL="file:./prisma/dev.db"
```

`DATABASE_URL` must stay as SQLite `file:./prisma/dev.db` for the default setup in this repo.

### 4. Backend – database and seed data

Still inside `backend`:

```bash
npm run db:generate
npx prisma db push
npm run db:seed
```

- `db:generate` creates the Prisma client.  
- `db push` creates/updates the SQLite database file from `prisma/schema.prisma`.  
- `db:seed` adds lessons, quizzes, and demo users.

### 5. Start the backend API

```bash
npm run dev
```

Leave this terminal open. You should see something like: `Backend running on http://localhost:4000`.

Test in the browser: [http://localhost:4000/health](http://localhost:4000/health) should return `{"ok":true}`.

### 6. Frontend – install dependencies (new terminal)

Open a **second** terminal, from the repo root:

```bash
cd frontend
npm install
```

### 7. Frontend – environment file

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Use the same host you use in the browser (prefer `http://localhost:3000` for the site and `http://localhost:4000` for the API).

### 8. Start the frontend

Still in `frontend`:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should get the login page.

### 9. Log in or register

**Demo accounts** (after a successful `npm run db:seed` in `backend`):

| Role          | Email                 | Password     |
|---------------|-----------------------|-------------|
| Child         | `emma@example.com`    | `password123` |
| Parent        | `parent@example.com`  | `password123` |
| Facilitator   | `teacher@example.com` | `password123` |

Or use **Register** to create a new account; then log in with that email and password.

### 10. Quick checks

- After login, open **Lessons** and open a lesson.  
- Complete a quiz from the lesson flow.  
- Child → **Dashboard** / **Progress**; parent/facilitator → their dashboards.

---

## Repo layout

- `backend/` – Express API, Prisma, SQLite (`prisma/dev.db` is local only, not committed).  
- `frontend/` – Next.js app.  
- `DEPLOYMENT.md` – notes for deploying elsewhere (e.g. hosted Postgres).  

Production deployment usually uses PostgreSQL; this README is for **local development with SQLite**.

## Troubleshooting

| Problem | What to try |
|--------|--------------|
| `Cannot reach the server` on login | Backend not running; run `npm run dev` in `backend`. |
| Lessons empty or errors | Run `npm run db:seed` again in `backend`. |
| Port 3000 in use | Next.js will suggest another port (e.g. 3001). If the API is still on 4000, keep `NEXT_PUBLIC_API_URL=http://localhost:4000`. |
| CORS / cookies odd | Use `http://localhost` for both app and API, not mixed `127.0.0.1` and `localhost`. |
| Prisma errors | From `backend`: `npm run db:generate` then `npx prisma db push`. |

## License

ISC (see `backend/package.json` / `frontend/package.json`).
