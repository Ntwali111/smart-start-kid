import { ReminderStatus } from "@prisma/client";
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

  const reminders = await prisma.reminder.findMany({
    where: { userId },
    orderBy: { reminderDate: "asc" },
  });
  return NextResponse.json(reminders);
}

export async function POST(request: Request) {
  try {
    const authUser = getUserFromRequest(request);
    const body = await request.json();
    const userId = String(body.userId ?? authUser?.sub ?? "");
    const type = String(body.type ?? "general");
    const message = String(body.message ?? "");
    const reminderDate = new Date(body.reminderDate ?? "");
    const status = (body.status ?? "pending") as ReminderStatus;

    if (!authUser || !userId || !message || Number.isNaN(reminderDate.getTime())) {
      return NextResponse.json({ message: "Unauthorized or invalid reminder payload." }, { status: 401 });
    }

    const reminder = await prisma.reminder.create({
      data: { userId, type, message, reminderDate, status },
    });
    return NextResponse.json(reminder, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to create reminder." }, { status: 500 });
  }
}

