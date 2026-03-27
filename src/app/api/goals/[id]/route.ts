import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const data: { currentAmount?: number; title?: string; targetAmount?: number } = {};
    if (body.currentAmount !== undefined) data.currentAmount = Number(body.currentAmount);
    if (body.title !== undefined) data.title = String(body.title);
    if (body.targetAmount !== undefined) data.targetAmount = Number(body.targetAmount);
    if (body.incrementAmount !== undefined) {
      const incrementAmount = Number(body.incrementAmount);
      if (incrementAmount <= 0) {
        return NextResponse.json({ message: "incrementAmount must be positive." }, { status: 400 });
      }
      const existingGoal = await prisma.savingsGoal.findUnique({ where: { id } });
      if (!existingGoal || existingGoal.userId !== authUser.sub) {
        return NextResponse.json({ message: "Goal not found." }, { status: 404 });
      }
      data.currentAmount = existingGoal.currentAmount + incrementAmount;
    }

    if (data.currentAmount !== undefined && data.currentAmount < 0) {
      return NextResponse.json({ message: "currentAmount cannot be negative." }, { status: 400 });
    }

    const ownedGoal = await prisma.savingsGoal.findUnique({ where: { id } });
    if (!ownedGoal || ownedGoal.userId !== authUser.sub) {
      return NextResponse.json({ message: "Goal not found." }, { status: 404 });
    }

    const goal = await prisma.savingsGoal.update({ where: { id }, data });

    return NextResponse.json(goal);
  } catch {
    return NextResponse.json({ message: "Failed to update goal." }, { status: 500 });
  }
}

