"use client";

import AppNav from "@/components/AppNav";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [averageQuizScore, setAverageQuizScore] = useState(0);
  const [goalsCount, setGoalsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const meRes = await apiFetch("/api/auth/me");
        if (!meRes.ok) {
          router.push("/login");
          return;
        }

        const me = await meRes.json();
        setName(me.user.fullName);

        const progressRes = await apiFetch("/api/progress");
        if (progressRes.ok) {
          const progress = await progressRes.json();
          setLessonsCompleted(progress.lessonsCompleted ?? 0);
          setAverageQuizScore(progress.averageQuizScore ?? 0);
          setGoalsCount(progress.goals?.length ?? 0);
        }
      } catch (error) {
        console.error(error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-lg">
        Loading your dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <AppNav />

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Welcome {name}! 👋
          </h1>
          <p className="text-xl text-purple-700 font-semibold">You're doing amazing! Keep learning! 🚀</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 p-6 text-center shadow-lg border-2 border-white transform hover:scale-105 transition-all duration-200">
            <p className="mb-3 text-5xl">📚</p>
            <p className="mb-2 font-bold text-white text-lg">Lessons Completed</p>
            <p className="text-4xl font-bold text-white">{lessonsCompleted}</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 p-6 text-center shadow-lg border-2 border-white transform hover:scale-105 transition-all duration-200">
            <p className="mb-3 text-5xl">🧠</p>
            <p className="mb-2 font-bold text-white text-lg">Quiz Score</p>
            <p className="text-4xl font-bold text-white">{averageQuizScore}%</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-green-400 to-emerald-400 p-6 text-center shadow-lg border-2 border-white transform hover:scale-105 transition-all duration-200">
            <p className="mb-3 text-5xl">🎯</p>
            <p className="mb-2 font-bold text-white text-lg">Savings Goals</p>
            <p className="text-4xl font-bold text-white">{goalsCount}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

