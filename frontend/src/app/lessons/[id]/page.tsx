"use client";

import AppNav from "@/components/AppNav";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

type Lesson = { id: string; title: string; content: string; category: string; ageGroup: string };

export default function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    void (async () => {
      const { id } = await params;
      const res = await apiFetch(`/api/lessons/${id}`);
      if (!res.ok) return;
      setLesson(await res.json());
    })();
  }, [params]);

  if (!lesson) return (
    <main className="min-h-screen bg-gradient-to-br from-blue-200 via-pink-200 to-purple-200 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">📚</p>
        <p className="text-2xl font-bold text-purple-700">Loading lesson...</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <AppNav />
        
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 p-8 shadow-lg">
          <h1 className="mb-3 text-4xl font-bold text-white">{lesson.title}</h1>
          <div className="flex flex-wrap gap-3">
            <span className="inline-block bg-white bg-opacity-90 text-purple-700 px-4 py-2 rounded-full font-bold text-sm">
              📚 {lesson.category}
            </span>
            <span className="inline-block bg-white bg-opacity-90 text-purple-700 px-4 py-2 rounded-full font-bold text-sm">
              👶 Ages: {lesson.ageGroup}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg mb-8 border-2 border-purple-200">
          <div className="prose prose-lg max-w-none whitespace-pre-wrap text-lg leading-relaxed text-gray-800 font-semibold">
            {lesson.content}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            className="flex-1 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-4 font-bold text-white text-center text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 active:scale-95 shadow-lg" 
            href={`/quiz/${lesson.id}`}
          >
            ✅ Take Quiz
          </Link>
          <Link 
            className="flex-1 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 px-6 py-4 font-bold text-white text-center text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 active:scale-95 shadow-lg" 
            href={`/lessons`}
          >
            ← Back to Lessons
          </Link>
        </div>
      </div>
    </main>
  );
}

