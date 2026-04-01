import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import type { CookieOptions } from "express";
import type { Prisma } from "@prisma/client";
import { ReminderStatus, UserRole } from "@prisma/client";
import {
  AUTH_COOKIE_NAME,
  comparePassword,
  hashPassword,
  signToken,
  verifyToken,
} from "./lib/auth";
import { prisma } from "./lib/prisma";

dotenv.config();

const app = express();
// Behind Railway / Render / other proxies (needed for secure cookies)
app.set("trust proxy", 1);
const port = Number(process.env.PORT ?? 4000);
const frontendOrigin = process.env.FRONTEND_URL ?? "http://localhost:3000";
const allowedOrigins = new Set([frontendOrigin, "http://localhost:3000", "http://localhost:3001"]);
const isProduction = process.env.NODE_ENV === "production";

function isLikelyLocalDevOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/** Allow phone/tablet testing on the same Wi‑Fi (non‑production only). */
function isPrivateLanHostname(hostname: string): boolean {
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  return /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname);
}

app.use(
  cors({
    origin(origin, callback) {
      // Tools / server-side requests often omit Origin.
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      if (!isProduction && isLikelyLocalDevOrigin(origin)) {
        callback(null, true);
        return;
      }
      if (!isProduction) {
        try {
          if (isPrivateLanHostname(new URL(origin).hostname)) {
            callback(null, true);
            return;
          }
        } catch {
          // ignore
        }
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

function currentUser(req: express.Request) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const user = currentUser(req);
  if (!user) {
    res.status(401).json({ message: "Unauthorized." });
    return;
  }
  (req as express.Request & { user?: ReturnType<typeof currentUser> }).user = user;
  next();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const fullName = String(req.body.fullName ?? "").trim();
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");
    const role = String(req.body.role ?? "child") as UserRole;

    const allowedRoles: UserRole[] = [
      UserRole.child,
      UserRole.parent,
      UserRole.facilitator,
    ];
    if (!fullName || !email || !password || !allowedRoles.includes(role)) {
      res.status(400).json({ message: "Invalid signup payload." });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "Email is already registered." });
      return;
    }

    const user = await prisma.user.create({
      data: { fullName, email, password: await hashPassword(password), role },
    });

    const token = signToken({
      sub: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
    });

    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions());

    res.json({
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch {
    res.status(500).json({ message: "Signup failed." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.password))) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const token = signToken({
      sub: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
    });

    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions());
    res.json({
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch {
    res.status(500).json({ message: "Login failed." });
  }
});

function cookieOptions(overrides: Partial<CookieOptions> = {}): CookieOptions {
  const prod = process.env.NODE_ENV === "production";
  // Frontend (e.g. Vercel) and API (e.g. Railway) are different sites — need SameSite=None for fetch+credentials.
  return {
    httpOnly: true,
    sameSite: prod ? ("none" as const) : ("lax" as const),
    secure: prod,
    maxAge: 60 * 60 * 24 * 7 * 1000,
    ...overrides,
  };
}

app.post("/api/auth/logout", (_req, res) => {
  res.cookie(AUTH_COOKIE_NAME, "", cookieOptions({ maxAge: 0 }));
  res.json({ ok: true });
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  const current = await prisma.user.findUnique({
    where: { id: user.sub },
    select: { id: true, fullName: true, email: true, role: true },
  });
  if (!current) {
    res.status(401).json({ message: "Unauthorized." });
    return;
  }
  res.json({ user: current });
});

app.get("/api/lessons", requireAuth, async (_req, res) => {
  const lessons = await prisma.lesson.findMany();

  // Keep a clear learning path in the UI.
  const lessonOrder = [
    "What is money?",
    "Saving money",
    "Needs vs wants",
    "Earning money",
    "Planning a simple budget",
  ];
  const orderMap = new Map(lessonOrder.map((title, index) => [title, index]));

  lessons.sort((a, b) => {
    const aIndex = orderMap.get(a.title) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = orderMap.get(b.title) ?? Number.MAX_SAFE_INTEGER;
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  res.json(lessons);
});

app.get("/api/lessons/:id", requireAuth, async (req, res) => {
  const id = String(req.params.id);
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      quizzes: {
        select: {
          id: true,
          lessonId: true,
          question: true,
          optionA: true,
          optionB: true,
          optionC: true,
          optionD: true,
        },
      },
    },
  });
  if (!lesson) {
    res.status(404).json({ message: "Lesson not found." });
    return;
  }
  res.json(lesson);
});

app.get("/api/quizzes/:lessonId", requireAuth, async (req, res) => {
  const lessonId = String(req.params.lessonId);
  const quizzes = await prisma.quiz.findMany({ where: { lessonId } });
  res.json(
    quizzes.map((q) => ({
      id: q.id,
      lessonId: q.lessonId,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
    })),
  );
});

app.post("/api/quizzes/submit", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  const lessonId = String(req.body.lessonId ?? "");
  const answers = (req.body.answers ?? {}) as Record<string, "A" | "B" | "C" | "D">;
  if (!lessonId) {
    res.status(400).json({ message: "lessonId is required." });
    return;
  }

  const questions = await prisma.quiz.findMany({ where: { lessonId } });
  const total = questions.length;
  const correct = questions.reduce((sum, q) => (answers[q.id] === q.correctAnswer ? sum + 1 : sum), 0);
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.sub, lessonId } },
    create: {
      userId: user.sub,
      lessonId,
      completed: true,
      score,
      completedAt: new Date(),
    },
    update: { completed: true, score, completedAt: new Date() },
  });
  res.json({ score, total, correct, progressId: progress.id });
});

app.get("/api/goals", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  const goals = await prisma.savingsGoal.findMany({
    where: { userId: user.sub },
    orderBy: { createdAt: "desc" },
  });
  res.json(goals);
});

app.post("/api/goals", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  const title = String(req.body.title ?? "");
  const targetAmount = Number(req.body.targetAmount ?? 0);
  if (!title || targetAmount <= 0) {
    res.status(400).json({ message: "Invalid goal payload." });
    return;
  }
  const goal = await prisma.savingsGoal.create({
    data: { userId: user.sub, title, targetAmount },
  });
  res.status(201).json(goal);
});

app.patch("/api/goals/:id", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  const id = String(req.params.id);
  const goal = await prisma.savingsGoal.findUnique({ where: { id } });
  if (!goal || goal.userId !== user.sub) {
    res.status(404).json({ message: "Goal not found." });
    return;
  }

  let currentAmount = goal.currentAmount;
  if (req.body.currentAmount !== undefined) currentAmount = Number(req.body.currentAmount);
  if (req.body.incrementAmount !== undefined) currentAmount += Number(req.body.incrementAmount);
  if (currentAmount < 0) {
    res.status(400).json({ message: "currentAmount cannot be negative." });
    return;
  }

  const updated = await prisma.savingsGoal.update({
    where: { id },
    data: {
      currentAmount,
      title: req.body.title !== undefined ? String(req.body.title) : undefined,
      targetAmount:
        req.body.targetAmount !== undefined ? Number(req.body.targetAmount) : undefined,
    },
  });
  res.json(updated);
});

app.get("/api/progress", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  const [lessonProgress, goals] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId: user.sub, completed: true },
      include: { lesson: { select: { title: true } } },
      orderBy: { completedAt: "desc" },
    }),
    prisma.savingsGoal.findMany({ where: { userId: user.sub } }),
  ]);
  const averageQuizScore =
    lessonProgress.length > 0
      ? Math.round(
          lessonProgress.reduce((sum, item) => sum + (item.score ?? 0), 0) /
            lessonProgress.length,
        )
      : 0;
  res.json({
    lessonsCompleted: lessonProgress.length,
    averageQuizScore,
    goals,
    lessonProgress,
  });
});

app.get("/api/reminders", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  const reminders = await prisma.reminder.findMany({
    where: { userId: user.sub },
    orderBy: { reminderDate: "asc" },
  });
  res.json(reminders);
});

app.post("/api/reminders", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  const type = String(req.body.type ?? "general");
  const message = String(req.body.message ?? "");
  const reminderDate = new Date(req.body.reminderDate ?? "");
  const status = (req.body.status ?? "pending") as ReminderStatus;
  if (!message || Number.isNaN(reminderDate.getTime())) {
    res.status(400).json({ message: "Invalid reminder payload." });
    return;
  }
  const reminder = await prisma.reminder.create({
    data: { userId: user.sub, type, message, reminderDate, status },
  });
  res.status(201).json(reminder);
});

app.get("/api/parent-dashboard", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  if (!["parent", "facilitator", "admin"].includes(user.role)) {
    res.status(403).json({ message: "Forbidden." });
    return;
  }

  const links = await prisma.parentChildLink.findMany({
    where: { parentId: user.sub },
    include: {
      child: {
        select: {
          id: true,
          fullName: true,
          lessonProgress: {
            where: { completed: true },
            select: { score: true, lesson: { select: { title: true } } },
          },
          savingsGoals: true,
        },
      },
    },
  });

  const children = links.map((link) => {
    const completed = link.child.lessonProgress.length;
    const averageQuizScore =
      completed > 0
        ? Math.round(
            link.child.lessonProgress.reduce((sum, item) => sum + (item.score ?? 0), 0) /
              completed,
          )
        : 0;
    return {
      id: link.child.id,
      fullName: link.child.fullName,
      lessonsCompleted: completed,
      averageQuizScore,
      activeSavingsGoals: link.child.savingsGoals.length,
      recentLessons: link.child.lessonProgress.slice(0, 3).map((item) => item.lesson.title),
    };
  });
  res.json({ children });
});

// Search for children by email - returns full progress data
app.get("/api/search-children", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  if (!["parent", "facilitator"].includes(user.role)) {
    res.status(403).json({ message: "Forbidden." });
    return;
  }

  const email = String(req.query.email ?? "").trim();
  if (!email) {
    res.json({ children: [] });
    return;
  }

  // Get already linked children
  const linked = await prisma.parentChildLink.findMany({
    where: { parentId: user.sub },
    select: { childId: true },
  });
  const linkedIds = linked.map((l) => l.childId);

  // Search for children by email that aren't already linked, include full progress data
  const children = await prisma.user.findMany({
    where: {
      role: UserRole.child,
      id: { notIn: linkedIds },
      // SQLite: use contains only (no Prisma `mode`; case depends on DB collation).
      email: { contains: email },
    },
    include: {
      lessonProgress: {
        where: { completed: true },
        select: { score: true, lesson: { select: { title: true } } },
      },
      savingsGoals: true,
    },
    take: 10,
  });

  // Transform to include progress data
  const childrenData = children.map((child) => {
    const completed = child.lessonProgress.length;
    const averageQuizScore =
      completed > 0
        ? Math.round(
            child.lessonProgress.reduce((sum, item) => sum + (item.score ?? 0), 0) / completed,
          )
        : 0;
    return {
      id: child.id,
      fullName: child.fullName,
      email: child.email,
      lessonsCompleted: completed,
      averageQuizScore,
      activeSavingsGoals: child.savingsGoals.length,
      recentLessons: child.lessonProgress.slice(0, 3).map((item) => item.lesson.title),
    };
  });

  res.json({ children: childrenData });
});

// Get list of available children to link
app.get("/api/available-children", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  if (!["parent", "facilitator"].includes(user.role)) {
    res.status(403).json({ message: "Forbidden." });
    return;
  }

  // Get all children that aren't already linked to this parent
  const linked = await prisma.parentChildLink.findMany({
    where: { parentId: user.sub },
    select: { childId: true },
  });
  const linkedIds = linked.map((l) => l.childId);

  const children = await prisma.user.findMany({
    where: {
      role: UserRole.child,
      id: { notIn: linkedIds },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  });
  res.json({ children });
});

// Link a child to parent/facilitator
app.post("/api/link-child", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  if (!["parent", "facilitator"].includes(user.role)) {
    res.status(403).json({ message: "Forbidden." });
    return;
  }

  const childId = String(req.body.childId ?? "");
  if (!childId) {
    res.status(400).json({ message: "childId is required." });
    return;
  }

  // Check if child exists and is a child role
  const child = await prisma.user.findUnique({ where: { id: childId } });
  if (!child || child.role !== UserRole.child) {
    res.status(404).json({ message: "Child not found." });
    return;
  }

  // Check if already linked
  const existing = await prisma.parentChildLink.findUnique({
    where: { parentId_childId: { parentId: user.sub, childId } },
  });
  if (existing) {
    res.status(409).json({ message: "Child is already linked." });
    return;
  }

  const link = await prisma.parentChildLink.create({
    data: { parentId: user.sub, childId },
  });
  res.status(201).json(link);
});

// Get detailed progress for a specific child
app.get("/api/child/:childId/progress", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  const childId = String(req.params.childId);

  // Verify the parent/facilitator has access to this child
  const link = await prisma.parentChildLink.findUnique({
    where: { parentId_childId: { parentId: user.sub, childId } },
  });
  if (!link && user.role !== "admin") {
    res.status(403).json({ message: "Forbidden." });
    return;
  }

  const child = await prisma.user.findUnique({
    where: { id: childId },
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
    },
  });

  if (!child) {
    res.status(404).json({ message: "Child not found." });
    return;
  }

  const [lessonProgress, goals] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId: childId },
      include: { lesson: { select: { id: true, title: true, category: true } } },
      orderBy: { completedAt: "desc" },
    }),
    prisma.savingsGoal.findMany({
      where: { userId: childId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const completed = lessonProgress.filter((p) => p.completed).length;
  const averageQuizScore =
    completed > 0
      ? Math.round(
          lessonProgress
            .filter((p) => p.completed)
            .reduce((sum, item) => sum + (item.score ?? 0), 0) / completed,
        )
      : 0;

  res.json({
    child,
    lessonsCompleted: completed,
    totalLessons: lessonProgress.length,
    averageQuizScore,
    lessonProgress,
    savingsGoals: goals,
  });
});

// Remove child link
app.delete("/api/link-child/:childId", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  const childId = String(req.params.childId);

  const link = await prisma.parentChildLink.findUnique({
    where: { parentId_childId: { parentId: user.sub, childId } },
  });
  if (!link) {
    res.status(404).json({ message: "Link not found." });
    return;
  }

  await prisma.parentChildLink.delete({
    where: { parentId_childId: { parentId: user.sub, childId } },
  });
  res.json({ ok: true });
});

// Facilitator: Get total count and search all children
app.get("/api/all-children", requireAuth, async (req, res) => {
  const user = (req as express.Request & { user: NonNullable<ReturnType<typeof currentUser>> }).user;
  if (user.role !== "facilitator") {
    res.status(403).json({ message: "Forbidden." });
    return;
  }

  const email = String(req.query.email ?? "").trim();

  // Get total count of all children
  const totalCount = await prisma.user.count({
    where: { role: UserRole.child },
  });

  // Search children by email or get all if no search
  const where: Prisma.UserWhereInput = {
    role: UserRole.child,
    ...(email ? { email: { contains: email } } : {}),
  };

  const children = await prisma.user.findMany({
    where,
    include: {
      lessonProgress: {
        where: { completed: true },
        select: { score: true, lesson: { select: { title: true } } },
      },
      savingsGoals: true,
    },
    orderBy: { fullName: "asc" },
    take: 50,
  });

  const childrenData = children.map((child) => {
    const completed = child.lessonProgress.length;
    const averageQuizScore =
      completed > 0
        ? Math.round(
            child.lessonProgress.reduce((sum, item) => sum + (item.score ?? 0), 0) /
              completed,
          )
        : 0;
    return {
      id: child.id,
      fullName: child.fullName,
      email: child.email,
      lessonsCompleted: completed,
      averageQuizScore,
      activeSavingsGoals: child.savingsGoals.length,
      recentLessons: child.lessonProgress.slice(0, 3).map((item) => item.lesson.title),
    };
  });

  res.json({ totalCount, children: childrenData });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});

