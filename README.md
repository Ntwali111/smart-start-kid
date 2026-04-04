# Smart Start Kids

This project is a web app that teaches children financial literacy skills and positive saving habits from an early age so these learners(children) read short lessons, answer quizzes, and set savings goals while their Parents and facilitators sign in and follow how learners are doing.

I built the full stack : a REST API in Node (Express), a Next.js frontend, and a PostgreSQL database with Prisma.

---

## What the app does (in plain words)

| Who | What they can do |
|-----|-------------------|
| **Child** | Sign up / log in, follow lessons in order, take quizzes, set savings goals, see progress. |
| **Parent** | Link to a child, search children by email, view dashboards and progress. |
| **Facilitator** | Link children, view class style lists and individual progress. |

Lessons start with 'What is money?'and continue through saving, needs vs wants, earning, and a simple budget idea.

---

## What I used

- **Frontend:** Next.js, React, TypeScript, Tailwind  
- **Backend:** Express, TypeScript  
- **Database:** PostgreSQL + Prisma (migrations in `backend/prisma/migrations`)  
- **Auth:** JWT in an **httpOnly** cookie; in production the cookie uses **SameSite=None** + **Secure** so the browser can send it when the site and API are on different domains (e.g. Vercel + Railway).


### Demo accounts (after `db:seed`)

| Role | Email | Password |
|------|--------|----------|
| Child | `emma@example.com` | `password123` |
| Parent | `parent@example.com` | `password123` |
| Facilitator | `teacher@example.com` | `password123` |

**register** a new account.

---
 I have 'two URLs': one for the 'frontend' and one for the 'API'.

2. **Frontend — [Vercel](https://vercel.com)**  


## Repository layout

- `backend/` — API, Prisma schema, migrations, `railway.toml`  
- `frontend/` — Next.js app, `vercel.json`  

---


---


