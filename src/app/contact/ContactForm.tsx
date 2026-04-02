"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const defaultEmail = "hello@edwardstravel.com";

function formatPlanTripTimingForEmail(monthText: string, yearStr: string): string {
  const m = monthText.trim();
  const y = yearStr.trim();
  if (!m && !y) return "";
  if (m && y) return `${m} ${y}`;
  if (m) return m;
  return `Year ${y}`;
}

type HelpTopic = "" | "business" | "plan-trip" | "other";

function topicFromParam(param: string | null): HelpTopic {
  if (param === "plan-trip" || param === "business" || param === "other") {
    return param;
  }
  return "";
}

function buildPlanTripMailto(params: {
  to: string;
  name: string;
  destination: string;
  travelType: string;
  month: string;
  length: string;
  notes: string;
}) {
  const subject = encodeURIComponent(
    `Plan your trip — ${params.name || "website visitor"}`,
  );
  const lines = [
    "How we can help: Plan your trip",
    "",
    `Name: ${params.name || "(not provided)"}`,
    `Destination ideas: ${params.destination || "(not provided)"}`,
    `Travel style: ${params.travelType || "(not provided)"}`,
    `Preferred timing: ${params.month || "(not provided)"}`,
    `Trip length: ${params.length || "(not provided)"}`,
    "",
    "More details:",
    params.notes || "(none)",
  ];
  const body = encodeURIComponent(lines.join("\n"));
  return `mailto:${params.to}?subject=${subject}&body=${body}`;
}

function buildBusinessMailto(params: {
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
    "How we can help: Business inquiries",
    "",
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

function buildOtherMailto(params: {
  to: string;
  name: string;
  replyEmail: string;
  message: string;
}) {
  const subject = encodeURIComponent(
    `Message from ${params.name || "website visitor"}`,
  );
  const lines = [
    "How we can help: Something else",
    "",
    `Name: ${params.name || "(not provided)"}`,
    `Email: ${params.replyEmail || "(not provided)"}`,
    "",
    "Message:",
    params.message || "(none)",
  ];
  const body = encodeURIComponent(lines.join("\n"));
  return `mailto:${params.to}?subject=${subject}&body=${body}`;
}

export function ContactForm({ initialTopic }: { initialTopic?: string }) {
  const searchParams = useSearchParams();
  const [helpTopic, setHelpTopic] = useState<HelpTopic>(() =>
    topicFromParam(initialTopic ?? null),
  );
  const [earliestTravelYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    setHelpTopic(topicFromParam(searchParams.get("topic")));
  }, [searchParams]);

  const [emailTo, setEmailTo] = useState(defaultEmail);

  // Plan your trip
  const [ptName, setPtName] = useState("");
  const [destination, setDestination] = useState("");
  const [travelType, setTravelType] = useState("");
  const [tripMonthText, setTripMonthText] = useState("");
  const [tripYearInput, setTripYearInput] = useState("");
  const [length, setLength] = useState("");
  const [ptNotes, setPtNotes] = useState("");

  // Business
  const [organization, setOrganization] = useState("");
  const [bizContactName, setBizContactName] = useState("");
  const [bizReplyEmail, setBizReplyEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [bizMessage, setBizMessage] = useState("");

  // Something else
  const [otherName, setOtherName] = useState("");
  const [otherEmail, setOtherEmail] = useState("");
  const [otherMessage, setOtherMessage] = useState("");

  const tripYearNum = useMemo(() => {
    const t = tripYearInput.trim();
    if (t === "") return null;
    const n = parseInt(t, 10);
    return Number.isFinite(n) ? n : NaN;
  }, [tripYearInput]);

  const planTripYearInvalid =
    tripYearInput.trim() !== "" &&
    (tripYearNum == null ||
      Number.isNaN(tripYearNum) ||
      tripYearNum < earliestTravelYear);

  const planTripTimingLabel = useMemo(() => {
    const y =
      tripYearInput.trim() === "" || planTripYearInvalid
        ? ""
        : String(tripYearNum);
    return formatPlanTripTimingForEmail(tripMonthText, y);
  }, [
    tripMonthText,
    tripYearInput,
    tripYearNum,
    planTripYearInvalid,
  ]);

  const mailtoHref = useMemo(() => {
    const to = emailTo.trim() || defaultEmail;
    if (helpTopic === "plan-trip") {
      if (planTripYearInvalid) {
        return "#";
      }
      return buildPlanTripMailto({
        to,
        name: ptName,
        destination,
        travelType,
        month: planTripTimingLabel,
        length,
        notes: ptNotes,
      });
    }
    if (helpTopic === "business") {
      return buildBusinessMailto({
        to,
        organization,
        contactName: bizContactName,
        replyEmail: bizReplyEmail,
        inquiryType,
        message: bizMessage,
      });
    }
    if (helpTopic === "other") {
      return buildOtherMailto({
        to,
        name: otherName,
        replyEmail: otherEmail,
        message: otherMessage,
      });
    }
    return `mailto:${to}`;
  }, [
    emailTo,
    helpTopic,
    ptName,
    destination,
    travelType,
    planTripTimingLabel,
    length,
    ptNotes,
    organization,
    bizContactName,
    bizReplyEmail,
    inquiryType,
    bizMessage,
    otherName,
    otherEmail,
    otherMessage,
    planTripYearInvalid,
  ]);

  const inputClass =
    "mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--color-ocean)]/30 focus:ring-2";
  const labelClass = "block text-sm font-medium text-[var(--color-ink)]";

  return (
    <form className="max-w-xl space-y-6" onSubmit={(e) => e.preventDefault()}>
      <p className="text-sm text-[var(--color-muted)]">
        Choose how we can help, then tell us more.  We&apos;ll open a pre-filled
        email draft in your mail app.
      </p>

      <div>
        <label htmlFor="contact-help-topic" className={labelClass}>
          How can we help you?
        </label>
        <select
          id="contact-help-topic"
          value={helpTopic}
          onChange={(e) => setHelpTopic(e.target.value as HelpTopic)}
          className={inputClass}
        >
          <option value="">Choose one…</option>
          <option value="business">Business inquiries</option>
          <option value="plan-trip">Plan your trip</option>
          <option value="other">Something else</option>
        </select>
      </div>

      {helpTopic === "plan-trip" && (
        <>
          <div>
            <label htmlFor="contact-name" className={labelClass}>
              Your name
            </label>
            <input
              id="contact-name"
              type="text"
              value={ptName}
              onChange={(e) => setPtName(e.target.value)}
              className={inputClass}
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="contact-destination" className={labelClass}>
              Where would you like to go?
            </label>
            <input
              id="contact-destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={inputClass}
              placeholder="e.g. Japan, Portugal, national parks…"
            />
          </div>
          <div>
            <label htmlFor="contact-type" className={labelClass}>
              What kind of trip are you imagining?
            </label>
            <select
              id="contact-type"
              value={travelType}
              onChange={(e) => setTravelType(e.target.value)}
              className={inputClass}
            >
              <option value="">Choose one…</option>
              <option value="Relaxing / resort">Relaxing / resort</option>
              <option value="Adventure / active">Adventure / active</option>
              <option value="Cultural / cities">Cultural / cities</option>
              <option value="Family">Family</option>
              <option value="Honeymoon or celebration">
                Honeymoon or celebration
              </option>
              <option value="Not sure yet">Not sure yet</option>
            </select>
          </div>
          <div className="space-y-4">
            <p className={labelClass}>When are you hoping to go?</p>
            <p className="text-xs text-[var(--color-muted)]">
              Type what works for you. Years must be{" "}
              <span className="font-medium">{earliestTravelYear}</span> or later
              (already-passed years aren&apos;t valid).
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-month-text" className={labelClass}>
                  Month or season
                </label>
                <input
                  id="contact-month-text"
                  type="text"
                  value={tripMonthText}
                  onChange={(e) => setTripMonthText(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. March, early summer, Q4…"
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="contact-year" className={labelClass}>
                  Year <span className="font-normal text-[var(--color-muted)]">(optional)</span>
                </label>
                <input
                  id="contact-year"
                  type="number"
                  inputMode="numeric"
                  min={earliestTravelYear}
                  step={1}
                  value={tripYearInput}
                  onChange={(e) => setTripYearInput(e.target.value)}
                  aria-invalid={planTripYearInvalid}
                  className={`${inputClass} tabular-nums ${
                    planTripYearInvalid
                      ? "border-[var(--color-coral)] ring-1 ring-[var(--color-coral)]/40"
                      : ""
                  }`}
                  placeholder={String(earliestTravelYear)}
                />
                {planTripYearInvalid ? (
                  <p className="mt-1.5 text-xs font-medium text-[var(--color-coral)]">
                    Use {earliestTravelYear} or a later year.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="contact-length" className={labelClass}>
              How long away?
            </label>
            <input
              id="contact-length"
              type="text"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className={inputClass}
              placeholder="e.g. 10 days"
            />
          </div>
          <div>
            <label htmlFor="contact-notes" className={labelClass}>
              Anything else we should know?
            </label>
            <textarea
              id="contact-notes"
              value={ptNotes}
              onChange={(e) => setPtNotes(e.target.value)}
              rows={4}
              className={`${inputClass} resize-y`}
              placeholder="Budget range, mobility needs, must-see spots…"
            />
          </div>
        </>
      )}

      {helpTopic === "business" && (
        <>
          <div>
            <label htmlFor="biz-organization" className={labelClass}>
              Organization
            </label>
            <input
              id="biz-organization"
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className={inputClass}
              placeholder="Company or publication name"
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="biz-contact-name" className={labelClass}>
                Your name
              </label>
              <input
                id="biz-contact-name"
                type="text"
                value={bizContactName}
                onChange={(e) => setBizContactName(e.target.value)}
                className={inputClass}
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="biz-reply-email" className={labelClass}>
                Your email
              </label>
              <input
                id="biz-reply-email"
                type="email"
                value={bizReplyEmail}
                onChange={(e) => setBizReplyEmail(e.target.value)}
                className={inputClass}
                autoComplete="email"
                placeholder="name@company.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="biz-inquiry-type" className={labelClass}>
              What is this regarding?
            </label>
            <select
              id="biz-inquiry-type"
              value={inquiryType}
              onChange={(e) => setInquiryType(e.target.value)}
              className={inputClass}
            >
              <option value="">Choose one…</option>
              <option value="Partnership or B2B">Partnership or B2B</option>
              <option value="Corporate / group travel">
                Corporate / group travel
              </option>
              <option value="Press or media">Press or media</option>
              <option value="Supplier or vendor">Supplier or vendor</option>
              <option value="Other business matter">Other business matter</option>
            </select>
          </div>
          <div>
            <label htmlFor="biz-message" className={labelClass}>
              Details
            </label>
            <textarea
              id="biz-message"
              value={bizMessage}
              onChange={(e) => setBizMessage(e.target.value)}
              rows={5}
              className={`${inputClass} resize-y`}
              placeholder="Briefly describe your request, timeline, and how we should follow up."
            />
          </div>
        </>
      )}

      {helpTopic === "other" && (
        <>
          <div>
            <label htmlFor="other-name" className={labelClass}>
              Your name
            </label>
            <input
              id="other-name"
              type="text"
              value={otherName}
              onChange={(e) => setOtherName(e.target.value)}
              className={inputClass}
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="other-email" className={labelClass}>
              Your email
            </label>
            <input
              id="other-email"
              type="email"
              value={otherEmail}
              onChange={(e) => setOtherEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="other-message" className={labelClass}>
              How can we help?
            </label>
            <textarea
              id="other-message"
              value={otherMessage}
              onChange={(e) => setOtherMessage(e.target.value)}
              rows={5}
              className={`${inputClass} resize-y`}
              placeholder="Tell us what you need and we’ll get back to you."
            />
          </div>
        </>
      )}

      {helpTopic !== "" && (
        <>
          <div>
            <label htmlFor="contact-email-to" className={labelClass}>
              Send to (your team email)
            </label>
            <input
              id="contact-email-to"
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
            <p className="mt-1.5 text-xs text-[var(--color-muted)]">
              Replace with your real inbox before launch.
            </p>
          </div>
          <a
            href={mailtoHref}
            onClick={(e) => {
              if (helpTopic === "plan-trip" && planTripYearInvalid) {
                e.preventDefault();
              }
            }}
            aria-disabled={
              helpTopic === "plan-trip" && planTripYearInvalid ? true : undefined
            }
            className={`inline-flex w-full items-center justify-center rounded-full bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105 sm:w-auto ${
              helpTopic === "plan-trip" && planTripYearInvalid
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            Open email draft
          </a>
          {helpTopic === "plan-trip" && planTripYearInvalid ? (
            <p className="text-xs text-[var(--color-muted)]">
              Fix the year above to open your mail draft.
            </p>
          ) : null}
        </>
      )}
    </form>
  );
}
