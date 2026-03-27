import AppNav from "@/components/AppNav";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export default async function LessonDetailPage({ params }: Props) {
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <AppNav />
      <h1 className="mb-2 text-3xl font-bold">{lesson.title}</h1>
      <p className="mb-6 text-zinc-600">{lesson.category} - {lesson.ageGroup}</p>
      <article className="rounded-xl border p-4 whitespace-pre-wrap">{lesson.content}</article>
      <Link
        className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 font-semibold text-white"
        href={`/quiz/${lesson.id}`}
      >
        Take Quiz
      </Link>
    </main>
  );
}

