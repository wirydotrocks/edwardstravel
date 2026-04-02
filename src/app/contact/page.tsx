import type { Metadata } from "next";
import { Suspense } from "react";
import { OfficeLocationsGlob } from "@/components/OfficeLocationsBlock";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Edwards Travel — business inquiries, trip planning, or anything else. Reach our Virginia Beach or Las Vegas offices.",
};

function ContactFormFallback() {
  return (
    <div
      className="max-w-xl space-y-4 text-sm text-[var(--color-muted)]"
      aria-hidden
    >
      Loading form…
    </div>
  );
}

function pickTopicParam(
  raw: string | string[] | undefined,
): string | undefined {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw[0];
  return undefined;
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string | string[] }>;
}) {
  const sp = await searchParams;
  const initialTopic = pickTopicParam(sp.topic);

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Contact us
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Tell us what you need — trip planning, a business conversation, or
        something else — and we&apos;ll take it from there.
      </p>

      <div className="mt-12 flex flex-col gap-10 lg:mt-14 lg:flex-row lg:items-start lg:gap-12 xl:gap-16">
        <div className="min-w-0 flex-1 lg:max-w-xl">
          <Suspense fallback={<ContactFormFallback />}>
            <ContactForm initialTopic={initialTopic} />
          </Suspense>
        </div>
        <aside className="w-full shrink-0 lg:max-w-md lg:pt-1">
          <OfficeLocationsGlob />
        </aside>
      </div>
    </main>
  );
}
