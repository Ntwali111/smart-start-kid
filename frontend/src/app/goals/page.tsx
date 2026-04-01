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
    <main className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-blue-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <AppNav />
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
            🎯 Savings Goals
          </h1>
          <p className="text-lg text-green-700 font-semibold">Create your goals and watch your savings grow! 🌱</p>
        </div>
        
        <div className="mb-8">
          <form onSubmit={createGoal} className="rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold text-white">Create a New Goal ✨</h2>
            <div className="space-y-4">
              <input 
                className="w-full rounded-xl border-2 border-transparent bg-white px-4 py-3 text-lg font-semibold placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all" 
                placeholder="Goal title (e.g., New Bike 🚲)" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
              />
              <input 
                className="w-full rounded-xl border-2 border-transparent bg-white px-4 py-3 text-lg font-semibold placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all" 
                placeholder="Target amount (e.g., 500)" 
                type="number"
                value={targetAmount} 
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
              <button className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-3 text-lg font-bold text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 active:scale-95">
                ✏️ Create Goal
              </button>
            </div>
          </form>
          {result && <p className="mt-4 rounded-xl bg-white p-3 font-semibold text-center text-green-700 shadow-md">{result}</p>}
        </div>

        <div>
          <h2 className="mb-4 text-3xl font-bold text-green-700">Your Goals 💚</h2>
          <div className="space-y-4">
            {goals.map((goal) => {
              const percentage = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
              return (
                <div key={goal.id} className="rounded-2xl bg-gradient-to-br from-white to-green-50 p-6 shadow-md border-2 border-green-200">
                  <h3 className="mb-2 text-2xl font-bold text-green-700">{goal.title}</h3>
                  <p className="mb-3 text-lg font-semibold text-gray-700">
                    💰 ${goal.currentAmount} / ${goal.targetAmount}
                  </p>
                  <p className="mb-4 text-sm text-gray-600">
                    Remaining: <span className="font-bold text-orange-600">${Math.max(0, goal.targetAmount - goal.currentAmount)}</span>
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <p className="font-semibold text-gray-700">Progress</p>
                      <p className="font-bold text-green-600 text-lg">{percentage}% 📈</p>
                    </div>
                    <div className="h-4 rounded-full bg-gray-300 overflow-hidden shadow-sm">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      className="flex-1 rounded-xl border-2 border-emerald-300 bg-white px-4 py-2 text-lg font-semibold text-gray-800 placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all" 
                      placeholder="Add amount 💵" 
                      type="number"
                      value={addByGoalId[goal.id] ?? ""} 
                      onChange={(e) => setAddByGoalId((prev) => ({ ...prev, [goal.id]: e.target.value }))} 
                    />
                    <button 
                      onClick={() => void addSavings(goal.id)} 
                      className="rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-2 text-lg font-bold text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 active:scale-95"
                    >
                      ➕ Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {goals.length === 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-blue-300 to-purple-300 p-8 text-center shadow-lg">
              <p className="text-2xl font-bold text-white">🎊 No goals yet!</p>
              <p className="text-white mt-2">Create your first savings goal above! 🚀</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

