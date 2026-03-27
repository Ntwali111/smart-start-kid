"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("child");
  const [result, setResult] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) return setResult(data.message);
    router.push(data.user.role === "child" ? "/dashboard" : "/parent-dashboard");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Register</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <select className="w-full rounded border p-2" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="child">Child</option>
          <option value="parent">Parent</option>
          <option value="facilitator">Facilitator</option>
        </select>
        <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white">Create account</button>
      </form>
      {result && <p className="mt-3">{result}</p>}
    </main>
  );
}

