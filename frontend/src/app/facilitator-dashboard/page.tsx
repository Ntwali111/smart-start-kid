"use client";

import AppNav from "@/components/AppNav";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

type ChildSummary = {
  id: string;
  fullName: string;
  email: string;
  lessonsCompleted: number;
  averageQuizScore: number;
  activeSavingsGoals: number;
  recentLessons: string[];
};

export default function FacilitatorDashboardPage() {
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [totalChildren, setTotalChildren] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChild, setSelectedChild] = useState<ChildSummary | null>(null);
  const [childDetails, setChildDetails] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "progress" | "score">("name");

  async function searchChildren(query: string) {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/all-children?email=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        console.error("Search error:", data);
        setError(data.message || "Failed to search children");
        setChildren([]);
        return;
      }
      setError("");
      setChildren(data.children || []);
      setTotalChildren(data.totalCount || 0);
    } catch (err) {
      console.error("Search exception:", err);
      setError("Failed to search children - connection error");
      setChildren([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadAllChildren() {
    await searchChildren("");
  }

  async function viewChildProgress(child: ChildSummary) {
    setSelectedChild(child);
    try {
      const res = await apiFetch(`/api/child/${child.id}/progress`);
      const data = await res.json();
      if (res.ok) {
        setChildDetails(data);
      } else {
        setError("Failed to load student progress");
      }
    } catch {
      setError("Failed to load student progress");
    }
  }

  const getSortedChildren = () => {
    const sorted = [...children];
    if (sortBy === "progress") {
      return sorted.sort((a, b) => b.lessonsCompleted - a.lessonsCompleted);
    } else if (sortBy === "score") {
      return sorted.sort((a, b) => b.averageQuizScore - a.averageQuizScore);
    }
    return sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
  };

  // Calculate class statistics
  const getClassStats = () => {
    if (children.length === 0) {
      return {
        totalStudents: 0,
        avgLessonsCompleted: 0,
        avgQuizScore: 0,
        avgSavingsGoals: 0,
      };
    }

    const totalLessons = children.reduce((sum, c) => sum + c.lessonsCompleted, 0);
    const totalScores = children.reduce((sum, c) => sum + c.averageQuizScore, 0);
    const totalGoals = children.reduce((sum, c) => sum + c.activeSavingsGoals, 0);

    return {
      totalStudents: children.length,
      avgLessonsCompleted: Math.round(totalLessons / children.length),
      avgQuizScore: Math.round(totalScores / children.length),
      avgSavingsGoals: Math.round(totalGoals / children.length),
    };
  };

  useEffect(() => {
    void loadAllChildren();
  }, []);

  const sortedChildren = getSortedChildren();
  const classStats = getClassStats();

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 px-4 py-8">
      <AppNav />
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-indigo-800">👨‍🏫 Facilitator Dashboard</h1>
          <p className="mt-2 text-xl text-gray-700">Manage and monitor all student progress</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-center text-red-700 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Search Section */}
        <div className="mb-10 rounded-3xl bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">🔍 Search Students</h2>
          <p className="mb-6 text-gray-600">Search by student email to view their progress:</p>
          
          <input
            type="text"
            placeholder="📧 Enter student email (or leave blank for all)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchChildren(e.target.value);
            }}
            className="w-full rounded-2xl border-3 border-indigo-300 bg-indigo-50 px-6 py-4 text-lg font-medium text-gray-800 placeholder-gray-500 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Class Statistics Card */}
        {classStats.totalStudents > 0 && (
          <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 p-6 text-white shadow-lg">
              <div className="text-sm font-semibold opacity-90">👥 Total Students</div>
              <div className="mt-3 text-4xl font-bold">{classStats.totalStudents}</div>
              <div className="mt-2 text-sm opacity-75">Students logged in</div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-green-400 to-green-600 p-6 text-white shadow-lg">
              <div className="text-sm font-semibold opacity-90">📚 Avg Lessons</div>
              <div className="mt-3 text-4xl font-bold">{classStats.avgLessonsCompleted}</div>
              <div className="mt-2 text-sm opacity-75">Per student</div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 p-6 text-white shadow-lg">
              <div className="text-sm font-semibold opacity-90">⭐ Avg Score</div>
              <div className="mt-3 text-4xl font-bold">{classStats.avgQuizScore}%</div>
              <div className="mt-2 text-sm opacity-75">Class average</div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 p-6 text-white shadow-lg">
              <div className="text-sm font-semibold opacity-90">💰 Avg Goals</div>
              <div className="mt-3 text-4xl font-bold">{classStats.avgSavingsGoals}</div>
              <div className="mt-2 text-sm opacity-75">Active per student</div>
            </div>
          </div>
        )}

        {/* Sort Controls */}
        {sortedChildren.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-3">
            <span className="flex items-center font-semibold text-gray-800">📊 Sort by:</span>
            {(["name", "progress", "score"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`rounded-2xl px-5 py-2 font-bold transition-all shadow-md ${
                  sortBy === option
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-white text-gray-800 border-2 border-gray-300 hover:border-indigo-600"
                }`}
              >
                {option === "name" && "📝 Name"}
                {option === "progress" && "📚 Progress"}
                {option === "score" && "⭐ Score"}
              </button>
            ))}
          </div>
        )}

        {/* Students Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedChildren.map((child) => (
            <div
              key={child.id}
              onClick={() => viewChildProgress(child)}
              className="cursor-pointer rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:border-indigo-400"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-indigo-800">👦 {child.fullName}</h3>
                <p className="text-sm text-gray-600">{child.email}</p>
                <p className="mt-2 text-xs text-gray-500 italic">Click to view full progress</p>
              </div>

              <div className="space-y-3 rounded-2xl bg-white bg-opacity-70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">📚 Lessons Completed</span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 font-bold text-blue-600">{child.lessonsCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">⭐ Average Score</span>
                  <span className="rounded-full bg-orange-100 px-3 py-1 font-bold text-orange-600">{child.averageQuizScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">💰 Active Goals</span>
                  <span className="rounded-full bg-green-100 px-3 py-1 font-bold text-green-600">{child.activeSavingsGoals}</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Learning Progress</span>
                    <span>{child.averageQuizScore}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-300">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                      style={{ width: `${Math.min(child.averageQuizScore, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Student View Modal */}
        {selectedChild && childDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="max-h-96 w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-indigo-800">{selectedChild.fullName}</h2>
                  <p className="text-gray-600">{selectedChild.email}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedChild(null);
                    setChildDetails(null);
                  }}
                  className="rounded-full bg-gray-200 px-4 py-2 font-bold text-gray-800 hover:bg-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* Key Stats */}
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-xs text-gray-700 font-semibold">Lessons Completed</p>
                  <p className="mt-2 text-3xl font-bold text-blue-600">{childDetails.lessonsCompleted}</p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-xs text-gray-700 font-semibold">Average Score</p>
                  <p className="mt-2 text-3xl font-bold text-orange-600">{childDetails.averageQuizScore}%</p>
                </div>
                <div className="rounded-2xl bg-green-50 p-4">
                  <p className="text-xs text-gray-700 font-semibold">Active Goals</p>
                  <p className="mt-2 text-3xl font-bold text-green-600">{childDetails.activeSavingsGoals}</p>
                </div>
                <div className="rounded-2xl bg-purple-50 p-4">
                  <p className="text-xs text-gray-700 font-semibold">Progress Score</p>
                  <p className="mt-2 text-3xl font-bold text-purple-600">{Math.round(childDetails.averageQuizScore)}%</p>
                </div>
              </div>

              {/* Recent Lesson Progress */}
              {childDetails.lessonProgress && childDetails.lessonProgress.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-bold text-gray-800">📚 Recent Lessons</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {childDetails.lessonProgress.slice(0, 5).map((lesson: any) => (
                      <div key={lesson.id} className="rounded-2xl bg-blue-50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{lesson.lesson.title}</p>
                            <p className="text-xs text-gray-600">{lesson.lesson.category}</p>
                          </div>
                          <span className="rounded-full bg-green-100 px-3 py-1 font-bold text-green-600">{lesson.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Savings Goals */}
              {childDetails.savingsGoals && childDetails.savingsGoals.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-bold text-gray-800">💰 Savings Goals</h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {childDetails.savingsGoals.map((goal: any) => (
                      <div key={goal.id} className="rounded-2xl bg-green-50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-800">{goal.title}</p>
                          <span className="text-sm font-bold text-green-600">${goal.currentAmount}/${goal.targetAmount}</span>
                        </div>
                        <div className="h-3 rounded-full bg-gray-300">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedChild(null);
                  setChildDetails(null);
                }}
                className="w-full rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white transition-all hover:bg-indigo-700 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {children.length === 0 && !loading && (
          <div className="rounded-3xl border-4 border-dashed border-indigo-300 bg-indigo-50 p-12 text-center">
            <p className="text-3xl font-bold text-indigo-800">👨‍🏫 No Students Yet</p>
            <p className="mt-3 text-gray-700">Students appear here once they create accounts and log in</p>
            <p className="mt-2 text-sm text-gray-600">Try searching with an empty query to see all students</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-700">Loading students...</p>
          </div>
        )}
      </div>
    </main>
  );
}
