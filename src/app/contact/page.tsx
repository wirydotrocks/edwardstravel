import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Edwards Travel to plan your trip.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Contact us
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Answer a few prompts—we&apos;ll open a pre-filled email so you can
        send it from your own address. For a production site, you may later swap
        this for a form that posts to a server or a service like Formspree.
      </p>
      <ContactForm />
    </main>
  );
}
