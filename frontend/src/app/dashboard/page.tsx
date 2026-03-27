"use client";

import AppNav from "@/components/AppNav";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [name, setName] = useState("Child");
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [averageQuizScore, setAverageQuizScore] = useState(0);
  const [goalsCount, setGoalsCount] = useState(0);

  useEffect(() => {
    void (async () => {
      const meRes = await apiFetch("/api/auth/me");
      if (meRes.ok) {
        const me = await meRes.json();
        setName(me.user.fullName);
      }
      const progressRes = await apiFetch("/api/progress");
      if (progressRes.ok) {
        const progress = await progressRes.json();
        setLessonsCompleted(progress.lessonsCompleted ?? 0);
        setAverageQuizScore(progress.averageQuizScore ?? 0);
        setGoalsCount(progress.goals?.length ?? 0);
      }
    })();
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <AppNav />
      <h1 className="mb-6 text-3xl font-bold">Welcome {name}!</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border p-4">Lessons Completed: {lessonsCompleted}</div>
        <div className="rounded-xl border p-4">Average Quiz Score: {averageQuizScore}%</div>
        <div className="rounded-xl border p-4">Savings Goals: {goalsCount}</div>
      </div>
    </main>
  );
}

