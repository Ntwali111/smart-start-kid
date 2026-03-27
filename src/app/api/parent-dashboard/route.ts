import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authUser = getUserFromRequest(request);
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get("parentId") ?? authUser?.sub;

  if (!authUser || !parentId) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  if (!["parent", "facilitator", "admin"].includes(authUser.role)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const links = await prisma.parentChildLink.findMany({
    where: { parentId },
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
            link.child.lessonProgress.reduce((acc, p) => acc + (p.score ?? 0), 0) / completed,
          )
        : 0;
    return {
      id: link.child.id,
      fullName: link.child.fullName,
      lessonsCompleted: completed,
      averageQuizScore,
      activeSavingsGoals: link.child.savingsGoals.length,
      recentLessons: link.child.lessonProgress.slice(0, 3).map((p) => p.lesson.title),
    };
  });

  return NextResponse.json({ children });
}

