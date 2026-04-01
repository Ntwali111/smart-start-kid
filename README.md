# Smart Start Kids

This is my exam project: a **web app that teaches children about money** in a simple, friendly way. Learners read short lessons, answer quizzes, and set savings goals. **Parents** and **facilitators** can sign in and follow how learners are doing.

I built the full stack myself: a **REST API** in Node (Express), a **Next.js** frontend, and a **PostgreSQL** database with Prisma.

---

## What the app does (in plain words)

| Who | What they can do |
|-----|-------------------|
| **Child** | Sign up / log in, follow lessons in order, take quizzes, set savings goals, see progress. |
| **Parent** | Link to a child, search children by email, view dashboards and progress. |
| **Facilitator** | Link children, view class-style lists and individual progress. |

Lessons start with *“What is money?”* and continue through saving, needs vs wants, earning, and a simple budget idea.

---

## What I used

- **Frontend:** Next.js, React, TypeScript, Tailwind  
- **Backend:** Express, TypeScript  
- **Database:** PostgreSQL + Prisma (migrations in `backend/prisma/migrations`)  
- **Auth:** JWT in an **httpOnly** cookie; in production the cookie uses **SameSite=None** + **Secure** so the browser can send it when the site and API are on different domains (e.g. Vercel + Railway).

---

## Run it locally

You need **Node.js 18+**, **npm**, and **PostgreSQL** (local install or a free database like [Neon](https://neon.tech)).

### Backend

```bash
cd backend
npm install
copy .env.example .env
```

Edit `backend/.env` — set `JWT_SECRET`, and `DATABASE_URL` for your Postgres (local example):

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=use-a-long-random-string
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/smart_start_kids?sslmode=disable"
```

Then:

```bash
npm run db:generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Check **http://localhost:4000/health** → `{"ok":true}`.

### Frontend (new terminal)

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

```bash
npm run dev
```

Open **http://localhost:3000**. Use **localhost** consistently (not mixed with `127.0.0.1`) for cookies.

### Demo accounts (after `db:seed`)

| Role | Email | Password |
|------|--------|----------|
| Child | `emma@example.com` | `password123` |
| Parent | `parent@example.com` | `password123` |
| Facilitator | `teacher@example.com` | `password123` |

You can also **register** a new account.

---

## Put it on the internet (public URL)

You need **two URLs**: one for the **frontend** and one for the **API**.

1. **API + database — [Railway](https://railway.app)**  
   - New project → **Deploy from GitHub** → pick this repo.  
   - Add **PostgreSQL**.  
   - Add a **service** from the same repo, **Root Directory:** `backend`.  
   - **Variables:** link `DATABASE_URL`, set `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL` = your Vercel URL (after step 2).  
   - Copy the API **public URL** (e.g. `https://xxxx.up.railway.app`).

2. **Frontend — [Vercel](https://vercel.com)**  
   - Import the repo, **Root Directory:** `frontend`.  
   - **Environment variable:** `NEXT_PUBLIC_API_URL` = your Railway API URL (no trailing slash).  
   - Deploy → copy your **site URL** (`https://your-app.vercel.app`). That is the link you share.

3. **CORS** — Set `FRONTEND_URL` on Railway to the exact Vercel URL, redeploy the API if needed.

4. **Seed production (once)** — Railway **Shell** on the backend, or locally with production `DATABASE_URL`:

```bash
cd backend
npx prisma db seed
```

---

## Repository layout

- `backend/` — API, Prisma schema, migrations, `railway.toml`  
- `frontend/` — Next.js app, `vercel.json`  

---

## If something goes wrong

- **Cannot reach server** — Start the backend (`npm run dev` in `backend`).  
- **Empty lessons** — Run `npm run db:seed` again (local) or seed production once.  
- **Login works locally but not on Vercel** — Check `FRONTEND_URL` on the API and `NEXT_PUBLIC_API_URL` on Vercel.  
- **Prisma errors** — `npm run db:generate`, then `npx prisma migrate deploy`.  

---

## License

ISC — see `backend/package.json` and `frontend/package.json`.
