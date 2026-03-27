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

  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  try {
    const authUser = getUserFromRequest(request);
    const body = await request.json();
    const userId = String(body.userId ?? authUser?.sub ?? "");
    const title = String(body.title ?? "");
    const targetAmount = Number(body.targetAmount ?? 0);
    const deadline = body.deadline ? new Date(body.deadline) : null;

    if (!authUser || !userId || !title || targetAmount <= 0) {
      return NextResponse.json({ message: "Unauthorized or invalid goal payload." }, { status: 401 });
    }

    const goal = await prisma.savingsGoal.create({
      data: { userId, title, targetAmount, deadline },
    });
    return NextResponse.json(goal, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to create goal." }, { status: 500 });
  }
}

