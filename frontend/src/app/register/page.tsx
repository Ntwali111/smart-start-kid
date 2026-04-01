"use client";

import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLES = [
  { value: "child", label: "👧 Child Learner", description: "Learn about money management through fun interactive lessons" },
  { value: "parent", label: "👨‍👩‍👧 Parent", description: "Track your child's progress and guide their learning" },
  { value: "facilitator", label: "👨‍🏫 Facilitator/Teacher", description: "Manage multiple children and their learning progress" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("child");
  const [result, setResult] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult("");

    try {
      const res = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const text = await res.text();
      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setResult("Server returned an invalid response.");
        return;
      }
      if (!res.ok) {
        setResult(data.message || "Registration failed.");
        return;
      }

      const redirectUrl = 
        data.user.role === "child" 
          ? "/dashboard" 
          : data.user.role === "parent"
          ? "/parent-dashboard"
          : "/facilitator-dashboard";
      
      router.push(redirectUrl);
    } catch {
      setResult("Something went wrong. Try again.");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-100 to-pink-100 px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-pink-300 text-3xl shadow-md">
            🐷
          </div>
          <h1 className="text-3xl font-bold text-pink-700">Create Account</h1>
          <p className="mt-2 text-sm text-gray-600">Start your saving journey 💰</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-gray-800 placeholder-gray-600 outline-none focus:ring-2 focus:ring-yellow-200"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-gray-800 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-gray-800 placeholder-gray-600 outline-none focus:ring-2 focus:ring-pink-200"
            placeholder="Create password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Role Selection Cards */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Who are you?</p>
            {ROLES.map((r) => (
              <label
                key={r.value}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                  role === r.value
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 bg-gray-50 hover:border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={role === r.value}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-4 w-4 cursor-pointer accent-blue-600"
                />
                <div className="ml-3 inline-flex flex-col">
                  <span className="font-semibold text-gray-800">{r.label}</span>
                  <span className="text-xs text-gray-600">{r.description}</span>
                </div>
              </label>
            ))}
          </div>

          <button className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-blue-500 py-3 font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95">
            Create account 🎉
          </button>
        </form>

        {result && <p className="mt-4 text-center text-sm text-red-600">{result}</p>}

        <p className="mt-5 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

