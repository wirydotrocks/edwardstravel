"use client";

import { RssFeedFromApi } from "@/components/RssFeedFromApi";

export function BlogFeedFromApi() {
  return (
    <RssFeedFromApi
      endpoint="/api/blog"
      searchLabel="Search blog posts"
      searchPlaceholder="Title, topic, or keyword..."
      errorMessage="Unable to load blog posts."
    />
  );
}
