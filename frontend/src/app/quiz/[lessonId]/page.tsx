"use client";

import AppNav from "@/components/AppNav";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

type Quiz = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
};

export default function QuizPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const [lessonId, setLessonId] = useState("");
  const [questions, setQuestions] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [result, setResult] = useState("");

  useEffect(() => {
    void (async () => {
      const { lessonId: id } = await params;
      setLessonId(id);
      const res = await apiFetch(`/api/quizzes/${id}`);
      if (!res.ok) return;
      setQuestions(await res.json());
    })();
  }, [params]);

  async function submitQuiz() {
    const res = await apiFetch("/api/quizzes/submit", {
      method: "POST",
      body: JSON.stringify({ lessonId, answers }),
    });
    const data = await res.json();
    setResult(res.ok ? `Score: ${data.score}% (${data.correct}/${data.total})` : data.message);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <AppNav />
      <h1 className="mb-4 text-3xl font-bold">Quiz</h1>
      <div className="space-y-4">
        {questions.map((q, index) => (
          <div key={q.id} className="rounded-xl border p-4">
            <p className="mb-2 font-semibold">{index + 1}. {q.question}</p>
            {(["A", "B", "C", "D"] as const).map((letter) => (
              <label key={letter} className="block">
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === letter}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: letter }))}
                />{" "}
                {q[`option${letter}` as keyof Quiz] as string}
              </label>
            ))}
          </div>
        ))}
      </div>
      <button onClick={submitQuiz} className="mt-6 rounded bg-blue-600 px-4 py-2 font-semibold text-white">Submit Quiz</button>
      {result && <p className="mt-3">{result}</p>}
    </main>
  );
}

