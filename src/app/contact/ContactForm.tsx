"use client";

import { useMemo, useState } from "react";

const defaultEmail = "hello@edwardstravel.com";

function buildMailto(params: {
  to: string;
  name: string;
  destination: string;
  travelType: string;
  month: string;
  length: string;
  notes: string;
}) {
  const subject = encodeURIComponent(
    `Travel inquiry from ${params.name || "website visitor"}`,
  );
  const lines = [
    `Name: ${params.name || "(not provided)"}`,
    `Destination ideas: ${params.destination || "(not provided)"}`,
    `Travel style: ${params.travelType || "(not provided)"}`,
    `Preferred month: ${params.month || "(not provided)"}`,
    `Trip length: ${params.length || "(not provided)"}`,
    "",
    "More details:",
    params.notes || "(none)",
  ];
  const body = encodeURIComponent(lines.join("\n"));
  return `mailto:${params.to}?subject=${subject}&body=${body}`;
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [travelType, setTravelType] = useState("");
  const [month, setMonth] = useState("");
  const [length, setLength] = useState("");
  const [notes, setNotes] = useState("");
  const [emailTo, setEmailTo] = useState(defaultEmail);

  const mailtoHref = useMemo(
    () =>
      buildMailto({
        to: emailTo.trim() || defaultEmail,
        name,
        destination,
        travelType,
        month,
        length,
        notes,
      }),
    [emailTo, name, destination, travelType, month, length, notes],
  );

  return (
    <form className="mt-10 max-w-xl space-y-6" onSubmit={(e) => e.preventDefault()}>
      <p className="text-sm text-[var(--color-muted)]">
        Replace the default address with your real inbox before launch. Answers
        are bundled into an email draft in your mail app—no server required.
      </p>
      <div>
        <label
          htmlFor="contact-email-to"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          Send to (your team email)
        </label>
        <input
          id="contact-email-to"
          type="email"
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
          className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--color-ocean)]/30 focus:ring-2"
          autoComplete="email"
        />
      </div>
      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          Your name
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--color-ocean)]/30 focus:ring-2"
          placeholder="Jane Doe"
          autoComplete="name"
        />
      </div>
      <div>
        <label
          htmlFor="contact-destination"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          Where would you like to go?
        </label>
        <input
          id="contact-destination"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--color-ocean)]/30 focus:ring-2"
          placeholder="e.g. Japan, Portugal, national parks…"
        />
      </div>
      <div>
        <label
          htmlFor="contact-type"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          What kind of trip are you imagining?
        </label>
        <select
          id="contact-type"
          value={travelType}
          onChange={(e) => setTravelType(e.target.value)}
          className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--color-ocean)]/30 focus:ring-2"
        >
          <option value="">Choose one…</option>
          <option value="Relaxing / resort">Relaxing / resort</option>
          <option value="Adventure / active">Adventure / active</option>
          <option value="Cultural / cities">Cultural / cities</option>
          <option value="Family">Family</option>
          <option value="Honeymoon or celebration">Honeymoon or celebration</option>
          <option value="Not sure yet">Not sure yet</option>
        </select>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-month"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            Preferred month
          </label>
          <input
            id="contact-month"
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--color-ocean)]/30 focus:ring-2"
            placeholder="e.g. October 2026"
          />
        </div>
        <div>
          <label
            htmlFor="contact-length"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            How long away?
          </label>
          <input
            id="contact-length"
            type="text"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--color-ocean)]/30 focus:ring-2"
            placeholder="e.g. 10 days"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="contact-notes"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          Anything else we should know?
        </label>
        <textarea
          id="contact-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-2 w-full resize-y rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--color-ocean)]/30 focus:ring-2"
          placeholder="Budget range, mobility needs, must-see spots…"
        />
      </div>
      <a
        href={mailtoHref}
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105 sm:w-auto"
      >
        Open email draft
      </a>
    </form>
  );
}
