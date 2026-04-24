import { SearchableBlogFeed } from "@/components/SearchableBlogFeed";
import {
  fetchBlogPosts,
  fetchExperiencePosts,
  tatPostToEdwardsRssItem,
} from "@/lib/tat-api";

function FeedError({ message }: { message: string }) {
  return (
    <div
      className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-sand)] px-5 py-4 text-sm text-[var(--color-muted)]"
      role="alert"
    >
      <p className="font-medium text-[var(--color-ink)]">
        We couldn&apos;t load the feed right now.
      </p>
      <p className="mt-1 font-mono text-xs">{message}</p>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Confirm <code className="rounded bg-white/60 px-1">TAT_API_TOKEN</code>,{" "}
        <code className="rounded bg-white/60 px-1">TAT_AGENCY_ID</code> if your
        tenant requires it, and that this server can reach{" "}
        <code className="rounded bg-white/60 px-1">api.gttwl2.com</code>.
      </p>
    </div>
  );
}

export async function TatBlogFeedFromServer() {
  try {
    const posts = await fetchBlogPosts();
    const items = posts.map((p) => tatPostToEdwardsRssItem(p, "blog"));
    return (
      <SearchableBlogFeed
        items={items}
        searchLabel="Search blog posts"
        searchPlaceholder="Title, topic, or keyword..."
        itemBasePath="/blog"
      />
    );
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Unable to load blog posts.";
    return <FeedError message={message} />;
  }
}

export async function TatExperiencesFeedFromServer() {
  try {
    const posts = await fetchExperiencePosts();
    const items = posts.map((p) => tatPostToEdwardsRssItem(p, "product"));
    return (
      <SearchableBlogFeed
        items={items}
        searchLabel="Search experiences"
        searchPlaceholder="Cruise, resort, destination, or keyword..."
        itemBasePath="/experiences"
      />
    );
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Unable to load experiences.";
    return <FeedError message={message} />;
  }
}

export function TatFeedSkeleton() {
  return (
    <div
      className="mt-10 h-12 animate-pulse rounded-xl bg-[var(--color-sand-muted)]"
      aria-hidden
    />
  );
}
