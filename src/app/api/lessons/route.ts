import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const lessons = await prisma.lesson.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      ageGroup: true,
      createdAt: true,
    },
  });

  return NextResponse.json(lessons);
}

