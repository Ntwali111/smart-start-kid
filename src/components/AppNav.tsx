"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  fullName: string;
  role: "child" | "parent" | "facilitator" | "admin";
};

export default function AppNav() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return;
      const data = await res.json();
      setUser(data.user);
    })();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const childLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/lessons", label: "Lessons" },
    { href: "/goals", label: "Goals" },
    { href: "/progress", label: "Progress" },
  ];
  const parentLinks = [{ href: "/parent-dashboard", label: "Parent Dashboard" }];
  const links =
    user?.role === "child" ? [...childLinks, ...parentLinks] : [{ href: "/dashboard", label: "Dashboard" }, ...parentLinks];

  return (
    <nav className="mb-6 rounded-xl border bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-lg border px-3 py-1.5 text-sm font-semibold hover:bg-blue-50">
            {link.label}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-zinc-600">{user ? `${user.fullName} (${user.role})` : "..."}</span>
          <button onClick={logout} className="rounded-lg border px-3 py-1.5 text-sm font-semibold">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

