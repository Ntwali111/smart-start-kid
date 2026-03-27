import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
export const AUTH_COOKIE_NAME = "ssk_token";

export type AuthPayload = {
  sub: string;
  role: "child" | "parent" | "facilitator" | "admin";
  fullName: string;
  email: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}

export function signToken(payload: AuthPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

export function getUserFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = cookieHeader.split(";").map((part) => part.trim());
  const tokenEntry = cookies.find((cookie) => cookie.startsWith(`${AUTH_COOKIE_NAME}=`));
  if (!tokenEntry) return null;

  const token = decodeURIComponent(tokenEntry.slice(AUTH_COOKIE_NAME.length + 1));
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

