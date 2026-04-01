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
    <main className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <AppNav />
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            🧠 Quiz Time!
          </h1>
          <p className="text-lg text-purple-700 font-semibold">Show us what you learned! 💪</p>
        </div>
        
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="rounded-2xl bg-white p-6 shadow-lg border-2 border-purple-300">
              <p className="mb-4 text-xl font-bold text-purple-700">
                <span className="rounded-full bg-purple-600 text-white w-8 h-8 inline-flex items-center justify-center mr-3">
                  {index + 1}
                </span>
                {q.question}
              </p>
              <div className="space-y-3">
                {(["A", "B", "C", "D"] as const).map((letter) => (
                  <label 
                    key={letter} 
                    className={`flex items-center p-4 rounded-xl border-3 cursor-pointer transition-all duration-200 transform hover:scale-102 ${
                      answers[q.id] === letter
                        ? "bg-gradient-to-r from-yellow-300 to-orange-300 border-orange-500 shadow-lg"
                        : "bg-gray-50 border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === letter}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: letter }))}
                      className="w-5 h-5 cursor-pointer accent-purple-600"
                    />
                    <span className="ml-4 text-lg font-semibold text-gray-800">
                      {letter}. {q[`option${letter}` as keyof Quiz] as string}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={submitQuiz} 
            className="rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 px-8 py-4 text-2xl font-bold text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-200 active:scale-95 shadow-lg"
          >
            ✅ Submit Quiz
          </button>
        </div>

        {result && (
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-yellow-300 to-orange-300 p-6 text-center shadow-lg border-3 border-orange-500">
            <p className="text-2xl font-bold text-orange-700">🎉 {result}</p>
          </div>
        )}
      </div>
    </main>
  );
}

