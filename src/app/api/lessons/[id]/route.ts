import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      quizzes: {
        select: { id: true, question: true, optionA: true, optionB: true, optionC: true, optionD: true },
      },
    },
  });

  if (!lesson) {
    return NextResponse.json({ message: "Lesson not found." }, { status: 404 });
  }

  return NextResponse.json(lesson);
}

