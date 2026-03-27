import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authUser = getUserFromRequest(request);
    const userId = String(body.userId ?? authUser?.sub ?? "");
    const lessonId = String(body.lessonId ?? "");
    const answers = (body.answers ?? {}) as Record<string, "A" | "B" | "C" | "D">;

    if (!authUser || !userId || !lessonId) {
      return NextResponse.json(
        { message: "Unauthorized or missing lessonId." },
        { status: 401 },
      );
    }

    const questions = await prisma.quiz.findMany({ where: { lessonId } });
    const total = questions.length;
    const correct = questions.reduce((sum, q) => {
      const answer = answers[q.id];
      return answer === q.correctAnswer ? sum + 1 : sum;
    }, 0);
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        completed: true,
        score,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        score,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ score, total, correct, progressId: progress.id });
  } catch {
    return NextResponse.json({ message: "Failed to submit quiz." }, { status: 500 });
  }
}

