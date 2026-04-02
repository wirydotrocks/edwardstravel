import Image from "next/image";
import Link from "next/link";
import { formatRssPostDate, type EdwardsRssItem } from "@/lib/edwards-rss";

function BlogCard({ item }: { item: EdwardsRssItem }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={`/blog/${item.slug}`}
        className="relative block aspect-[16/10] bg-[var(--color-sand-muted)]"
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            quality={95}
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-ocean)]/15 to-[var(--color-sand-muted)]">
            <span className="text-sm font-medium text-[var(--color-muted)]">
              Edwards Travel
            </span>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {item.category ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ocean)]">
            {item.category}
          </p>
        ) : null}
        <h2 className="mt-2 font-serif text-lg font-semibold leading-snug text-[var(--color-ocean-deep)]">
          <Link
            href={`/blog/${item.slug}`}
            className="hover:text-[var(--color-ocean)]"
          >
            {item.title}
          </Link>
        </h2>
        {item.publishedAt ? (
          <time
            dateTime={item.publishedAt}
            className="mt-2 block text-xs text-[var(--color-muted)]"
          >
            {formatRssPostDate(item.publishedAt)}
          </time>
        ) : null}
        {item.snippet ? (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--color-muted)]">
            {item.snippet}
          </p>
        ) : null}
        <Link
          href={`/blog/${item.slug}`}
          className="mt-4 inline-flex w-fit text-sm font-semibold text-[var(--color-ocean)] underline-offset-4 hover:underline"
        >
          Read article →
        </Link>
      </div>
    </article>
  );
}

export function BlogFeed({ items }: { items: EdwardsRssItem[] }) {
  if (items.length === 0) {
    return (
      <p className="mt-10 text-[var(--color-muted)]">
        No posts are available in the feed right now.
      </p>
    );
  }

  return (
    <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <BlogCard key={item.slug} item={item} />
      ))}
    </div>
  );
}
