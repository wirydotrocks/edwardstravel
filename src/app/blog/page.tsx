import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Travel stories and updates from Edwards Travel.",
};

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Blog
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Blog posts will load from your RSS feed. For now, this is a placeholder
        route so navigation works end-to-end.
      </p>
    </main>
  );
}
