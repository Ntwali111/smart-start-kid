import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <h1 className="text-4xl font-bold text-blue-700">Smart Start Kids</h1>
      <p className="text-lg text-zinc-700">
        Child-friendly financial literacy platform built with Next.js, React, Prisma, and PostgreSQL.
      </p>
      <section className="grid gap-4 sm:grid-cols-2">
        {[
          ["/login", "Login"],
          ["/register", "Register"],
          ["/dashboard", "Child Dashboard"],
          ["/lessons", "Lessons"],
          ["/goals", "Savings Goals"],
          ["/progress", "Progress"],
          ["/parent-dashboard", "Parent Dashboard"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border bg-white px-4 py-3 text-lg font-semibold shadow-sm hover:bg-blue-50"
          >
            {label}
          </Link>
        ))}
      </section>
    </main>
  );
}
