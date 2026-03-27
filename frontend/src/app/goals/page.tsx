"use client";

import AppNav from "@/components/AppNav";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

type Goal = { id: string; title: string; targetAmount: number; currentAmount: number };

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [addByGoalId, setAddByGoalId] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [result, setResult] = useState("");

  async function loadGoals() {
    const res = await apiFetch("/api/goals");
    const data = await res.json();
    if (!res.ok) return setResult(data.message);
    setGoals(data);
  }

  useEffect(() => {
    void (async () => {
      await loadGoals();
    })();
  }, []);

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    const res = await apiFetch("/api/goals", {
      method: "POST",
      body: JSON.stringify({ title, targetAmount: Number(targetAmount) }),
    });
    const data = await res.json();
    setResult(res.ok ? `Goal created: ${data.title}` : data.message);
    if (res.ok) {
      setTitle("");
      setTargetAmount("");
      await loadGoals();
    }
  }

  async function addSavings(goalId: string) {
    const amount = Number(addByGoalId[goalId] ?? 0);
    if (amount <= 0) return setResult("Enter valid amount.");
    const res = await apiFetch(`/api/goals/${goalId}`, {
      method: "PATCH",
      body: JSON.stringify({ incrementAmount: amount }),
    });
    const data = await res.json();
    setResult(res.ok ? `Updated: ${data.title}` : data.message);
    if (res.ok) await loadGoals();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <AppNav />
      <h1 className="mb-6 text-3xl font-bold">Savings Goals</h1>
      <form onSubmit={createGoal} className="space-y-3 rounded-xl border p-4">
        <input className="w-full rounded border p-2" placeholder="Goal title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Target amount" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
        <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white">Create Goal</button>
      </form>
      {result && <p className="mt-4">{result}</p>}
      <div className="mt-6 grid gap-3">
        {goals.map((goal) => {
          const percentage = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
          return (
            <article key={goal.id} className="rounded-xl border p-4">
              <h2 className="font-semibold">{goal.title}</h2>
              <p>Saved: {goal.currentAmount} / {goal.targetAmount}</p>
              <p>Remaining: {Math.max(0, goal.targetAmount - goal.currentAmount)}</p>
              <p>Progress: {percentage}%</p>
              <div className="mt-3 flex gap-2">
                <input className="w-44 rounded border p-2" placeholder="Add amount" value={addByGoalId[goal.id] ?? ""} onChange={(e) => setAddByGoalId((prev) => ({ ...prev, [goal.id]: e.target.value }))} />
                <button onClick={() => void addSavings(goal.id)} className="rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                  Add Savings
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

