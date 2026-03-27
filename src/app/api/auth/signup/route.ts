import { UserRole } from "@prisma/client";
import { AUTH_COOKIE_NAME, hashPassword, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const role = String(body.role ?? "child") as UserRole;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: "fullName, email and password are required." },
        { status: 400 },
      );
    }

    const allowedRoles: UserRole[] = [
      UserRole.child,
      UserRole.parent,
      UserRole.facilitator,
    ];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ message: "Invalid role." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Email is already registered." },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: await hashPassword(password),
        role,
      },
    });

    const token = signToken({
      sub: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Signup failed." }, { status: 500 });
  }
}

