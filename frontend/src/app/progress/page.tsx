"use client";

import AppNav from "@/components/AppNav";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LessonProgressItem = {
  completedAt: string;
  score: number | null;
  lesson: { title: string };
};

type SavingsGoal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
};

export default function ProgressPage() {
  const router = useRouter();
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [averageQuizScore, setAverageQuizScore] = useState(0);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProgress() {
    try {
      const res = await apiFetch("/api/progress");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setLessonsCompleted(data.lessonsCompleted ?? 0);
      setAverageQuizScore(data.averageQuizScore ?? 0);
      setGoals(data.goals ?? []);
      setLessonProgress(data.lessonProgress ?? []);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      await loadProgress();
    })();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-lg">
        Loading your progress...
      </main>
    );
  }

  const totalGoalsAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const goalProgressPercent = totalTargetAmount > 0 ? Math.round((totalGoalsAmount / totalTargetAmount) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <AppNav />

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            📊 Your Progress
          </h1>
          <p className="text-lg text-purple-700 font-semibold">Keep up the great work! 🌟</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 p-6 text-center shadow-lg border-2 border-white">
            <p className="text-5xl mb-2">📚</p>
            <p className="mb-2 font-bold text-white text-lg">Lessons Completed</p>
            <p className="text-3xl font-bold text-white">{lessonsCompleted}</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 p-6 text-center shadow-lg border-2 border-white">
            <p className="text-5xl mb-2">🧠</p>
            <p className="mb-2 font-bold text-white text-lg">Average Quiz Score</p>
            <p className="text-3xl font-bold text-white">{averageQuizScore}%</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-green-400 to-emerald-400 p-6 text-center shadow-lg border-2 border-white">
            <p className="text-5xl mb-2">💰</p>
            <p className="mb-2 font-bold text-white text-lg">Savings Progress</p>
            <p className="text-3xl font-bold text-white">{goalProgressPercent}%</p>
          </div>
        </div>

        {goals.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-3xl font-bold text-pink-700">💚 Savings Goals</h2>
            <div className="space-y-4">
              {goals.map((goal) => {
                const percentage = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                return (
                  <div key={goal.id} className="rounded-2xl bg-white p-5 shadow-md border-2 border-emerald-200 hover:shadow-lg transition-all">
                    <div className="flex justify-between mb-3 items-center">
                      <p className="font-bold text-xl text-gray-800">{goal.title}</p>
                      <p className="text-lg font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">{percentage}%</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 font-semibold">💵 ${goal.currentAmount} / ${goal.targetAmount}</p>
                    <div className="h-4 rounded-full bg-gray-300 overflow-hidden shadow-sm">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {lessonProgress.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-3xl font-bold text-blue-700">📚 Recent Lessons</h2>
            <div className="space-y-3">
              {lessonProgress.slice(0, 5).map((item, idx) => (
                <div key={idx} className="rounded-2xl bg-white p-4 shadow-md border-2 border-blue-200 hover:shadow-lg transition-all flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-800">✅ {item.lesson.title}</span>
                  <span className="text-lg font-bold bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
                    {item.score ?? 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => void loadProgress()}
            className="rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 px-8 py-4 font-bold text-white text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 active:scale-95 shadow-lg"
          >
            🔄 Refresh Progress
          </button>
        </div>
      </div>
    </main>
  );
}

