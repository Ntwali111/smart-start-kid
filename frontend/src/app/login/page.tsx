"use client";

import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult("");

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const text = await res.text();
      let data: { message?: string; user?: { role: string } } = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setResult("Server returned an invalid response. Is the backend running on port 4000?");
        return;
      }

      if (!res.ok) {
        if (res.status === 401) {
          setResult(data.message || "Invalid email or password.");
        } else if (res.status === 0 || res.status >= 500) {
          setResult("Server error. Try again in a moment.");
        } else {
          setResult(data.message || "Login failed. Please try again.");
        }
        return;
      }

      if (!data.user?.role) {
        setResult("Login succeeded but user data was missing. Please refresh and try again.");
        return;
      }

      router.push(
        data.user.role === "child"
          ? "/dashboard"
          : data.user.role === "parent"
            ? "/parent-dashboard"
            : "/facilitator-dashboard"
      );
    } catch {
      setResult(
        "Cannot reach the server. From the project folder run: cd backend && npm run dev. Use the same host for app and API (e.g. both localhost or both 127.0.0.1).",
      );
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-300 text-3xl shadow-md">
            🌟
          </div>
          <h1 className="text-3xl font-bold text-blue-700">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">Continue your smart money journey 💰</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-gray-800 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-gray-800 placeholder-gray-600 outline-none focus:ring-2 focus:ring-pink-200"
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full rounded-2xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
            Login 🚀
          </button>
        </form>

        {result && <p className="mt-4 text-center text-sm text-red-600">{result}</p>}

        <p className="mt-5 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link href="/register" className="font-semibold text-pink-600">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

