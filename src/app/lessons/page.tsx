import { prisma } from "@/lib/prisma";
import AppNav from "@/components/AppNav";
import Link from "next/link";

export default async function LessonsPage() {
  const lessons = await prisma.lesson.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <AppNav />
      <h1 className="mb-6 text-3xl font-bold">Lessons</h1>
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/lessons/${lesson.id}`}
            className="block rounded-xl border p-4 hover:bg-blue-50"
          >
            <p className="text-xl font-semibold">{lesson.title}</p>
            <p className="text-sm text-zinc-600">{lesson.category} - {lesson.ageGroup}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

