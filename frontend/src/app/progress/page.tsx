"use client";

import AppNav from "@/components/AppNav";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

export default function ProgressPage() {
  const [result, setResult] = useState("Loading...");

  async function loadProgress() {
    const res = await apiFetch("/api/progress");
    const data = await res.json();
    setResult(
      res.ok
        ? `Lessons completed: ${data.lessonsCompleted}, Average score: ${data.averageQuizScore}%`
        : data.message,
    );
  }

  useEffect(() => {
    void (async () => {
      await loadProgress();
    })();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <AppNav />
      <h1 className="mb-6 text-3xl font-bold">Progress</h1>
      <button onClick={() => void loadProgress()} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white">Refresh Progress</button>
      {result && <p className="mt-4">{result}</p>}
    </main>
  );
}

