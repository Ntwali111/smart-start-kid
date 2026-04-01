"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type User = {
  fullName: string;
  role: "child" | "parent" | "facilitator" | "admin";
};

export default function AppNav() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await apiFetch("/api/auth/me");
      if (!res.ok) return;
      const data = await res.json();
      setUser(data.user);
    })();
  }, []);

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const getNavLinks = () => {
    if (!user) return [];
    
    if (user.role === "child") {
      return [
        { href: "/dashboard", label: "📊 Dashboard" },
        { href: "/lessons", label: "📚 Lessons" },
        { href: "/goals", label: "💰 Goals" },
        { href: "/progress", label: "📈 Progress" },
      ];
    } else if (user.role === "parent") {
      return [
        { href: "/parent-dashboard", label: "👨‍👩‍👧 My Children" },
      ];
    } else if (user.role === "facilitator") {
      return [
        { href: "/facilitator-dashboard", label: "👨‍🏫 My Class" },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="mb-6 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 p-4 shadow-lg border-2 border-white">
      <div className="flex flex-wrap items-center gap-3">
        {navLinks.map((link) => (
          <Link 
            key={link.href} 
            href={link.href} 
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-purple-600 hover:bg-yellow-200 hover:scale-105 transition-all duration-200 active:scale-95 shadow-md"
          >
            {link.label}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm font-semibold text-white bg-black bg-opacity-20 px-3 py-2 rounded-lg">
            👤 {user ? `${user.fullName}` : "..."}
          </span>
          <button 
            onClick={logout} 
            className="rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2 text-sm font-bold text-white hover:scale-105 transition-all duration-200 active:scale-95 shadow-lg transform"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

