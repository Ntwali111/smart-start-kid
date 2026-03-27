import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
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
const port = Number(process.env.PORT ?? 4000);
const frontendOrigin = process.env.FRONTEND_URL ?? "http://localhost:3000";

app.use(cors({ origin: frontendOrigin, credentials: true }));
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

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

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

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });
    res.json({
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch {
    res.status(500).json({ message: "Login failed." });
  }
});

app.post("/api/auth/logout", (_req, res) => {
  res.cookie(AUTH_COOKIE_NAME, "", { httpOnly: true, maxAge: 0 });
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
  const lessons = await prisma.lesson.findMany({ orderBy: { createdAt: "desc" } });
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

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});

