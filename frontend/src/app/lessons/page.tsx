"use client";

import AppNav from "@/components/AppNav";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

type Lesson = { id: string; title: string; category: string; ageGroup: string };

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await apiFetch("/api/lessons");
      if (!res.ok) return;
      setLessons(await res.json());
    })();
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <AppNav />
      <h1 className="mb-6 text-3xl font-bold">Lessons</h1>
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="block rounded-xl border p-4 hover:bg-blue-50">
            <p className="text-xl font-semibold">{lesson.title}</p>
            <p className="text-sm text-zinc-600">{lesson.category} - {lesson.ageGroup}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

