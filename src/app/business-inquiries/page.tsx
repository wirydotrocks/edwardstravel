import type { Metadata } from "next";
import { BusinessInquiriesForm } from "./BusinessInquiriesForm";

export const metadata: Metadata = {
  title: "Business Inquiries",
  description:
    "Contact Edwards Travel for partnerships, corporate travel, press, and other business matters.",
};

export default function BusinessInquiriesPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Business inquiries
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Planning a personal trip? Use{" "}
        <a
          href="/contact"
          className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
        >
          Contact
        </a>{" "}
        instead. This form is for organizations and business-related requests.
      </p>
      <BusinessInquiriesForm />
    </main>
  );
}
