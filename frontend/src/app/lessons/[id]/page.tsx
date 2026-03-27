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

  if (!lesson) return <main className="p-8">Loading...</main>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <AppNav />
      <h1 className="mb-2 text-3xl font-bold">{lesson.title}</h1>
      <p className="mb-6 text-zinc-600">{lesson.category} - {lesson.ageGroup}</p>
      <article className="rounded-xl border p-4 whitespace-pre-wrap">{lesson.content}</article>
      <Link className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 font-semibold text-white" href={`/quiz/${lesson.id}`}>
        Take Quiz
      </Link>
    </main>
  );
}

