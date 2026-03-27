"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return setResult(data.message);
    setResult(`Welcome ${data.user.fullName}`);
    router.push(data.user.role === "child" ? "/dashboard" : "/parent-dashboard");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white">Login</button>
      </form>
      {result && <p className="mt-3">{result}</p>}
    </main>
  );
}

