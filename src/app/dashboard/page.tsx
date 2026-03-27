"use client";

import AppNav from "@/components/AppNav";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [name, setName] = useState("Child");
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [averageQuizScore, setAverageQuizScore] = useState(0);
  const [goalsCount, setGoalsCount] = useState(0);

  async function loadDashboard() {
    const meRes = await fetch("/api/auth/me");
    if (meRes.ok) {
      const me = await meRes.json();
      setName(me.user.fullName);
    }

    const progressRes = await fetch("/api/progress");
    if (progressRes.ok) {
      const progress = await progressRes.json();
      setLessonsCompleted(progress.lessonsCompleted ?? 0);
      setAverageQuizScore(progress.averageQuizScore ?? 0);
      setGoalsCount(progress.goals?.length ?? 0);
    }
  }

  useEffect(() => {
    void (async () => {
      await loadDashboard();
    })();
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <AppNav />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome {name}!</h1>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border p-4">Lessons Completed: {lessonsCompleted}</div>
        <div className="rounded-xl border p-4">Average Quiz Score: {averageQuizScore}%</div>
        <div className="rounded-xl border p-4">Savings Goals: {goalsCount}</div>
      </div>
      <p className="text-zinc-600">Use the navigation above to continue.</p>
    </main>
  );
}

