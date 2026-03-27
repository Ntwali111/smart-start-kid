import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ lessonId: string }> };

export async function GET(_: Request, context: Context) {
  const { lessonId } = await context.params;
  const quizzes = await prisma.quiz.findMany({
    where: { lessonId },
    select: {
      id: true,
      lessonId: true,
      question: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
    },
  });

  return NextResponse.json(quizzes);
}

