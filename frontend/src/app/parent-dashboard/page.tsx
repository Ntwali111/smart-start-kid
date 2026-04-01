"use client";

import AppNav from "@/components/AppNav";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

type ChildSummary = {
  id: string;
  fullName: string;
  lessonsCompleted: number;
  averageQuizScore: number;
  activeSavingsGoals: number;
  recentLessons: string[];
};

type SearchResult = {
  id: string;
  fullName: string;
  email: string;
};

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildSummary | null>(null);
  const [childDetails, setChildDetails] = useState<any>(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/parent-dashboard");
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setError("");
      setChildren(data.children);
    } finally {
      setLoading(false);
    }
  }

  async function searchChildren(query: string) {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    try {
      const res = await apiFetch(`/api/search-children?email=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to search for children");
        return;
      }
      setError("");
      setSearchResults(data.children);
      setShowSearchResults(true);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search for children");
    }
  }

  async function addChild(childId: string, childName: string) {
    try {
      const res = await apiFetch("/api/link-child", {
        method: "POST",
        body: JSON.stringify({ childId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setSearchQuery("");
      setSearchResults([]);
      setShowSearchResults(false);
      await loadDashboard();
      setError("");
    } catch {
      setError("Failed to add child");
    }
  }

  async function unlinkChild(childId: string) {
    if (!confirm("Are you sure you want to remove this child?")) return;
    try {
      const res = await apiFetch(`/api/link-child/${childId}`, { method: "DELETE" });
      if (res.ok) {
        await loadDashboard();
        setSelectedChild(null);
        setChildDetails(null);
      }
    } catch {
      setError("Failed to unlink child");
    }
  }

  async function viewChildProgress(child: ChildSummary) {
    setSelectedChild(child);
    try {
      const res = await apiFetch(`/api/child/${child.id}/progress`);
      const data = await res.json();
      if (res.ok) {
        setChildDetails(data);
      }
    } catch {
      setError("Failed to load child progress");
    }
  }

  useEffect(() => {
    void (async () => {
      await loadDashboard();
    })();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 px-4 py-8">
      <AppNav />
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-purple-800">👨‍👩‍👧 Parent Dashboard</h1>
          <p className="mt-2 text-xl text-gray-700">Monitor your child's financial learning & progress</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-center text-red-700 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Search and Add Children Section */}
        {children.length === 0 ? (
          <div className="mb-10 rounded-3xl border-4 border-dashed border-purple-300 bg-purple-50 p-8">
            <h2 className="mb-4 text-2xl font-bold text-purple-800">📝 Get Started</h2>
            <p className="mb-6 text-gray-700">You haven't linked any children yet. Search for your child below:</p>
            
            <div className="mb-6">
              <input
                type="text"
                placeholder="� Enter child's email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchChildren(e.target.value);
                }}
                className="w-full rounded-2xl border-3 border-purple-400 bg-white px-6 py-4 text-lg font-medium text-gray-800 placeholder-gray-500 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            {showSearchResults && searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800">✨ Results found:</h3>
                {searchResults.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between rounded-2xl border-2 border-purple-300 bg-white p-4 shadow-md"
                  >
                    <div>
                      <p className="font-bold text-purple-800">{child.fullName}</p>
                      <p className="text-sm text-gray-600">{child.email}</p>
                    </div>
                    <button
                      onClick={() => addChild(child.id, child.fullName)}
                      className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2 font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                      + Link Child
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showSearchResults && searchQuery && searchResults.length === 0 && (
              <div className="rounded-2xl bg-yellow-50 p-4 text-center text-yellow-800">
                <p className="font-semibold">😕 No children found with that name</p>
                <p className="mt-1 text-sm">Make sure they have created an account first</p>
              </div>
            )}
          </div>
        ) : (
          /* Add More Children Button */
          <div className="mb-10 rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">🔍 Add Another Child?</h2>
              <button
                onClick={() => setShowSearchResults(!showSearchResults)}
                className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2 font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                {showSearchResults ? "Close" : "+ Add Child"}
              </button>
            </div>

            {showSearchResults && (
              <div className="mt-6">
                <input
                  type="text"
                  placeholder="� Enter child's email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchChildren(e.target.value);
                  }}
                  className="w-full rounded-2xl border-3 border-blue-300 bg-blue-50 px-6 py-4 text-lg font-medium text-gray-800 placeholder-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />

                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {searchResults.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between rounded-2xl border-2 border-blue-300 bg-white p-4"
                      >
                        <div>
                          <p className="font-bold text-blue-800">{child.fullName}</p>
                          <p className="text-sm text-gray-600">{child.email}</p>
                        </div>
                        <button
                          onClick={() => addChild(child.id, child.fullName)}
                          className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2 font-bold text-white transition-all hover:scale-105 active:scale-95"
                        >
                          + Link
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Children Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <div
              key={child.id}
              className="cursor-pointer rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              onClick={() => viewChildProgress(child)}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-purple-800">👧 {child.fullName}</h3>
                  <p className="text-sm text-gray-600">Student Profile</p>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl bg-white bg-opacity-60 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">📚 Lessons Completed:</span>
                  <span className="font-bold text-blue-600">{child.lessonsCompleted}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">⭐ Average Score:</span>
                  <span className="font-bold text-orange-600">{child.averageQuizScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">💰 Active Goals:</span>
                  <span className="font-bold text-green-600">{child.activeSavingsGoals}</span>
                </div>
              </div>

              {child.recentLessons.length > 0 && (
                <div className="mt-3 text-xs text-gray-700">
                  <p className="font-semibold">Recent Lessons:</p>
                  <p className="text-gray-600">{child.recentLessons.join(", ")}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detailed Child View */}
        {selectedChild && childDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="max-h-96 w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{selectedChild.fullName}'s Progress</h2>
                <button
                  onClick={() => unlinkChild(selectedChild.id)}
                  className="rounded-2xl bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
                >
                  Remove
                </button>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-sm text-gray-700">Lessons Completed</p>
                  <p className="text-3xl font-bold text-blue-600">{childDetails.lessonsCompleted}</p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-sm text-gray-700">Average Score</p>
                  <p className="text-3xl font-bold text-orange-600">{childDetails.averageQuizScore}%</p>
                </div>
              </div>

              <h3 className="mb-3 font-bold">Lesson Progress Details:</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {childDetails.lessonProgress.map((lesson: any) => (
                  <div key={lesson.id} className="rounded-2xl bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{lesson.lesson.title}</p>
                        <p className="text-xs text-gray-600">{lesson.lesson.category}</p>
                      </div>
                      <span className="text-sm font-bold text-green-600">{lesson.score}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="mb-2 mt-4 font-bold">Savings Goals:</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {childDetails.savingsGoals.map((goal: any) => (
                  <div key={goal.id} className="rounded-2xl bg-green-50 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{goal.title}</p>
                        <div className="mt-1 h-2 w-24 rounded-full bg-gray-300">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        ${goal.currentAmount}/${goal.targetAmount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setSelectedChild(null);
                  setChildDetails(null);
                }}
                className="mt-6 w-full rounded-2xl bg-gray-300 px-4 py-2 font-semibold text-gray-800 transition-transform hover:scale-105 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {children.length === 0 && !loading && (
          <div className="rounded-3xl border-4 border-dashed border-gray-300 bg-white bg-opacity-50 p-8 text-center">
            <p className="text-2xl font-bold text-gray-800">👨‍👩‍👧 No Children Linked Yet</p>
            <p className="mt-2 text-gray-600">Click "Link Child" to start monitoring their progress!</p>
          </div>
        )}
      </div>
    </main>
  );
}

