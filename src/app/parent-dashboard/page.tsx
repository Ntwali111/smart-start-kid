"use client";

import AppNav from "@/components/AppNav";
import { useEffect, useState } from "react";

type ChildSummary = {
  id: string;
  fullName: string;
  lessonsCompleted: number;
  averageQuizScore: number;
  activeSavingsGoals: number;
  recentLessons: string[];
};

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [error, setError] = useState("");

  async function loadDashboard() {
    const res = await fetch("/api/parent-dashboard");
    const data = await res.json();
    if (!res.ok) {
      setError(data.message);
      return;
    }
    setError("");
    setChildren(data.children);
  }

  useEffect(() => {
    void (async () => {
      await loadDashboard();
    })();
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <AppNav />
      <h1 className="mb-6 text-3xl font-bold">Parent/Facilitator Dashboard</h1>
      <button onClick={loadDashboard} className="mt-3 rounded bg-blue-600 px-4 py-2 font-semibold text-white">
        View Child Progress
      </button>
      {error && <p className="mt-3 text-red-600">{error}</p>}
      <div className="mt-6 grid gap-4">
        {children.map((child) => (
          <article key={child.id} className="rounded-xl border p-4">
            <h2 className="text-xl font-semibold">{child.fullName}</h2>
            <p>Lessons completed: {child.lessonsCompleted}</p>
            <p>Average quiz score: {child.averageQuizScore}%</p>
            <p>Active savings goals: {child.activeSavingsGoals}</p>
            {child.recentLessons.length > 0 && (
              <p className="mt-2 text-sm text-zinc-600">
                Recent lessons: {child.recentLessons.join(", ")}
              </p>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

