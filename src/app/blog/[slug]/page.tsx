import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sanitizeBlogHtml } from "@/lib/blog-html";
import {
  formatRssPostDate,
  getEdwardsRssItemBySlug,
  getEdwardsRssItems,
} from "@/lib/edwards-rss";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const items = await getEdwardsRssItems();
    return items.map((item) => ({ slug: item.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getEdwardsRssItemBySlug(slug);
  if (!item) {
    return { title: "Post not found" };
  }
  return {
    title: item.title,
    description: item.snippet || `Edwards Travel — ${item.title}`,
    ...(item.publishedAt
      ? {
          openGraph: {
            type: "article",
            publishedTime: item.publishedAt,
          },
        }
      : {}),
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getEdwardsRssItemBySlug(slug);
  if (!item) notFound();

  const bodyHtml =
    item.contentHtml.trim().length > 0
      ? sanitizeBlogHtml(item.contentHtml)
      : null;

  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-[var(--color-ocean)]">
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>
      </p>
      {item.category ? (
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          {item.category}
        </p>
      ) : null}
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[var(--color-ocean-deep)] sm:text-4xl">
        {item.title}
      </h1>
      {item.publishedAt ? (
        <time
          dateTime={item.publishedAt}
          className="mt-3 block text-sm text-[var(--color-muted)]"
        >
          {formatRssPostDate(item.publishedAt)}
        </time>
      ) : null}

      {item.imageUrl ? (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[var(--color-sand-muted)]">
          <Image
            src={item.imageUrl}
            alt=""
            fill
            quality={95}
            className="object-cover"
            sizes="(min-width: 768px) 720px, 100vw"
            priority
          />
        </div>
      ) : null}

      {bodyHtml ? (
        <div
          className="blog-post-body mt-10 max-w-none text-[var(--color-ink)] [&_a]:text-[var(--color-ocean)] [&_a]:underline-offset-2 [&_a]:hover:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--color-ocean)]/35 [&_blockquote]:pl-4 [&_blockquote]:text-[var(--color-muted)] [&_figure]:my-6 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:mt-4 [&_h4]:font-semibold [&_img]:mx-auto [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      ) : (
        <p className="mt-10 text-[var(--color-muted)]">
          This post doesn&apos;t have any content in the feed yet.
        </p>
      )}

      <div className="mt-14 flex justify-center border-t border-[var(--color-border)] pt-10">
        <Link
          href="/contact?topic=plan-trip"
          className="inline-flex rounded-full bg-[var(--color-coral)] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105"
        >
          Start your trip today
        </Link>
      </div>
    </main>
  );
}
