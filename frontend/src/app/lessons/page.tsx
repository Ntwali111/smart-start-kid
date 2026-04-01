"use client";

import AppNav from "@/components/AppNav";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

type Lesson = { id: string; title: string; category: string; ageGroup: string };

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    void (async () => {
      const res = await apiFetch("/api/lessons");
      if (!res.ok) {
        setError("Could not load lessons. Please log in again and refresh the page.");
        return;
      }
      setLessons(await res.json());
    })();
  }, []);

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      "savings": "🐷",
      "budgeting": "💰",
      "spending": "🛍️",
      "investing": "📈",
      "banking": "🏦",
      "financial literacy": "📚",
    };
    return emojis[category.toLowerCase()] || "💡";
  };

  const getCardColor = (category: string) => {
    const colors: Record<string, string> = {
      "savings": "from-purple-400 to-pink-400",
      "budgeting": "from-blue-400 to-cyan-400",
      "spending": "from-yellow-400 to-orange-400",
      "investing": "from-green-400 to-emerald-400",
      "banking": "from-indigo-400 to-blue-400",
      "financial literacy": "from-rose-400 to-pink-400",
    };
    return colors[category.toLowerCase()] || "from-blue-400 to-purple-400";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-blue-200 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <AppNav />
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            🎓 Lessons
          </h1>
          <p className="text-lg text-purple-700 font-semibold">Learn about money and become a financial superstar! 🌟</p>
        </div>
        {error ? (
          <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <Link 
              key={lesson.id} 
              href={`/lessons/${lesson.id}`} 
              className={`block rounded-3xl bg-gradient-to-br ${getCardColor(lesson.category)} p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group`}
            >
              <div className="mb-4 text-5xl">{getCategoryEmoji(lesson.category)}</div>
              <p className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-100 transition-colors">{lesson.title}</p>
              <div className="flex items-center justify-between">
                <p className="inline-block bg-white bg-opacity-80 text-sm font-semibold px-3 py-1 rounded-full text-purple-700">
                  {lesson.category}
                </p>
                <p className="text-lg">👉</p>
              </div>
              <p className="mt-3 text-sm text-white/90">Ages: {lesson.ageGroup}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

