Smart Start Kids

This is web app that teaches children about money. Learners read short lessons, answer quizzes, and can set savings goals. Parents and facilitators get their own screens so they can see how a child is doing not just scores, but progress over time.

I built the full stack : a small REST API in Node , Next.js website for the UI, and the database behind it so users and progress are saved properly.

 What the app does 

Who and What they can do 

Child : Sign up / log in, follow lessons in order, take quizzes, set savings goals, see their own progress. 
Parent :Link to a child’s account, search children by email, see dashboards and progress for linked kids. 
Facilitator :Similar to parents: link children, view class lists and individual progress. 

Lessons are ordered so learning feels like a path for example it starts with What is money? and continues through saving, needs vs wants, earning, and a simple budget idea. Each lesson can have quiz questions; submitting answers saves a score and marks progress.

What I used (tech)
Frontend: Next.js, React, TypeScript, Tailwind CSS  
Backend: Express (Node), TypeScript  
Database: SQLite locally, with Prisma as the ORM (models for users, lessons, quizzes, goals, links between parents and children, etc.)  
Security:Passwords are hashed; login uses a JWT stored in an httpOnly cookie so the browser sends it safely with API calls  

The frontend talks to the backend using `NEXT_PUBLIC_API_URL` (for local dev, `http://localhost:4000`). CORS is set so the React app and API can work together when both run on your machine.

What I actually built (project work)

1. Backend 
   Routes for sign up, login, logout, who am I, lessons (list + detail), quizzes (list + submit), savings goals, reminders, progress, and parent/facilitator features (search children, link child, dashboards, child progress).  
   I used Prisma to define the schema and seed the database with demo users and lesson content.

2. Frontend 
   Pages for login, register, dashboards (child / parent / facilitator), lessons list and lesson detail, quiz flow, goals, and progress.  
   API calls go through a small helper that always sends **credentials** so cookies work.

3. Database & seeding:
   SQLite file (dev.db) is created locally; it is **not** committed to Git. Running the seed script fills lessons, quizzes, and test accounts so the app is easy to demo.

4. Quality of life fixes I cared about:
   Fixed seed data when it broke, ordered lessons for a clear curriculum, relaxed CORS for local dev (different ports / hosts), and kept the README honest about how to run everything.


How to run it (step by step)

You need Node.js 18+ and npm.

### Backend

bash
cd backend
npm install
copy .env.example .env

Edit backend/.env so it includes at least:

env
PORT=4000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=change-this-for-anything-serious
DATABASE_URL="file:./prisma/dev.db"


Then:

bash
npm run db:generate
npx prisma db push
npm run db:seed
npm run dev
```

Leave this terminal open. Check http://localhost:4000/health** — you should see {"ok":true}.

 Frontend (new terminal, from project root)

bash
cd frontend
npm install

Create frontend/.env.local:

env
NEXT_PUBLIC_API_URL=http://localhost:4000


Then:

bash
npm run dev

Open **http://localhost:3000**. Use **localhost** consistently (avoid mixing `127.0.0.1` and `localhost`) so login cookies work reliably.

### Demo logins (after `db:seed`)

Role :Child,Parent, Facilitator
Email:emma@example.com,parent@example.com,teacher@example.com
Password :password123,password123,password123


You can also register a new account and use that instead.

Repository layout

- backend/— API server, Prisma schema and seed, environment example.  
- frontend/ — Next.js app and UI.  

 If something goes wrong

- Cannot reach serveron login , Start the backend first (npm run dev in backend).  
- Empty lessons** ,Run npm run db:seed again in backend.  
- Prisma errors ,From `backend`: npm run db:generate then npx prisma db push.  



 Deploying (short note)

For a real public deployment you would typically host the frontend (e.g. Vercel) and the API on a platform that runs Node (e.g. Railway, Render) with a production database (often PostgreSQL), set NEXT_PUBLIC_API_URL, `FRONTEND_URL`, JWT_SECRET, and DATABASE_URL on the server, then build and start the backend. Local development uses SQLite as above.


 License

ISC  see backend/package.json and frontend/package.json.
