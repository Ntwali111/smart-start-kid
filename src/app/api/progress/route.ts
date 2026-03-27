import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authUser = getUserFromRequest(request);
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? authUser?.sub;

  if (!authUser || !userId) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const [lessonProgress, goals] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId, completed: true },
      include: { lesson: { select: { title: true } } },
      orderBy: { completedAt: "desc" },
    }),
    prisma.savingsGoal.findMany({ where: { userId } }),
  ]);

  const averageQuizScore =
    lessonProgress.length > 0
      ? Math.round(
          lessonProgress.reduce((acc, item) => acc + (item.score ?? 0), 0) / lessonProgress.length,
        )
      : 0;

  return NextResponse.json({
    lessonsCompleted: lessonProgress.length,
    averageQuizScore,
    goals,
    lessonProgress,
  });
}

