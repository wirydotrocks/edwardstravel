"use client";

import { useMemo, useState } from "react";

const defaultEmail = "hello@edwardstravel.com";

function buildMailto(params: {
  to: string;
  organization: string;
  contactName: string;
  replyEmail: string;
  inquiryType: string;
  message: string;
}) {
  const subject = encodeURIComponent(
    `Business inquiry${params.organization ? ` — ${params.organization}` : ""}`,
  );
  const lines = [
    `Organization: ${params.organization || "(not provided)"}`,
    `Contact name: ${params.contactName || "(not provided)"}`,
    `Reply email: ${params.replyEmail || "(not provided)"}`,
    `Inquiry type: ${params.inquiryType || "(not provided)"}`,
    "",
    "Message:",
    params.message || "(none)",
  ];
  const body = encodeURIComponent(lines.join("\n"));
  return `mailto:${params.to}?subject=${subject}&body=${body}`;
}

export function BusinessInquiriesForm() {
  const [organization, setOrganization] = useState("");
  const [contactName, setContactName] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [message, setMessage] = useState("");
  const [emailTo, setEmailTo] = useState(defaultEmail);

  const mailtoHref = useMemo(
    () =>
      buildMailto({
        to: emailTo.trim() || defaultEmail,
        organization,
        contactName,
        replyEmail,
        inquiryType,
        message,
      }),
    [emailTo, organization, contactName, replyEmail, inquiryType, message],
  );

  return (
    <form
      className="mt-10 max-w-xl space-y-6"
      onSubmit={(e) => e.preventDefault()}
    >
      <p className="text-sm text-[var(--color-muted)]">
        For partnerships, press, corporate programs, and other business matters.
        Replace the default address with your team inbox before launch.
      </p>
      <div>
        <label
          htmlFor="biz-email-to"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          Send to (internal inbox)
        </label>
        <input
          id="biz-email-to"
          type="email"
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
          className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--color-ocean)]/30 focus:ring-2"
          autoComplete="email"
        />
      </div>
      <div>
        <label
          htmlFor="biz-organization"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          Organization
        </label>
        <input
          id="biz-organization"
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--color-ocean)]/30 focus:ring-2"
          placeholder="Company or publication name"
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="biz-contact-name"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            Your name
          </label>
          <input
            id="biz-contact-name"
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--color-ocean)]/30 focus:ring-2"
            autoComplete="name"
          />
        </div>
        <div>
          <label
            htmlFor="biz-reply-email"
            className="block text-sm font-medium text-[var(--color-ink)]"
          >
            Your email
          </label>
          <input
            id="biz-reply-email"
            type="email"
            value={replyEmail}
            onChange={(e) => setReplyEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--color-ocean)]/30 focus:ring-2"
            autoComplete="email"
            placeholder="name@company.com"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="biz-inquiry-type"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          What is this regarding?
        </label>
        <select
          id="biz-inquiry-type"
          value={inquiryType}
          onChange={(e) => setInquiryType(e.target.value)}
          className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--color-ocean)]/30 focus:ring-2"
        >
          <option value="">Choose one…</option>
          <option value="Partnership or B2B">Partnership or B2B</option>
          <option value="Corporate / group travel">Corporate / group travel</option>
          <option value="Press or media">Press or media</option>
          <option value="Supplier or vendor">Supplier or vendor</option>
          <option value="Other business matter">Other business matter</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="biz-message"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          Details
        </label>
        <textarea
          id="biz-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="mt-2 w-full resize-y rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--color-ocean)]/30 focus:ring-2"
          placeholder="Briefly describe your request, timeline, and how we should follow up."
        />
      </div>
      <a
        href={mailtoHref}
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-ocean)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105 sm:w-auto"
      >
        Open email draft
      </a>
    </form>
  );
}
