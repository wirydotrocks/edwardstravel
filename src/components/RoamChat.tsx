"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildPlanTripContactHref,
  parseRoamAssistantReply,
} from "@/lib/roam-message-format";
import {
  planNotesFromMessage,
  resolveDestinationUpTo,
  resolveThreadDestination,
} from "@/lib/roam-destination-detect";
import { ROAM_WELCOME_MESSAGE, roamActivitiesPrompt } from "@/lib/roam-prompt";

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function friendlyRoamError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("quota") ||
    lower.includes("429") ||
    lower.includes("rate limit") ||
    lower.includes("too many requests")
  ) {
    return "Roam is temporarily busy. Please wait a minute and try again.";
  }
  if (lower.includes("too long") || lower.includes("too large")) {
    return message;
  }
  if (lower.includes("forbidden")) {
    return "Roam could not accept that request. Refresh the page and try again.";
  }
  return "Something went wrong. Please try again in a moment.";
}

function RoamBubble({
  children,
  showRoamLabel = false,
  variant = "idea",
}: {
  children: React.ReactNode;
  showRoamLabel?: boolean;
  variant?: "idea" | "summary";
}) {
  return (
    <div className="flex justify-start">
      <div
        className={`max-w-[min(100%,36rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          variant === "summary"
            ? "border border-[var(--color-ocean)]/35 bg-[var(--color-sand)] text-[var(--color-ink)]"
            : "border border-[var(--color-border)] bg-[var(--color-sand)]/50 text-[var(--color-ink)]"
        }`}
      >
        {showRoamLabel ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-ocean-deep)]">
            Roam
          </p>
        ) : null}
        {variant === "summary" ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-ocean)]">
            Quick recap
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

function PlanThisTripButton({
  destination,
  notes,
}: {
  destination: string;
  notes?: string;
}) {
  return (
    <Link
      href={buildPlanTripContactHref({ destination, notes })}
      className="inline-flex items-center justify-center rounded-full border-2 border-[var(--color-ocean)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-ocean-deep)] shadow-sm transition hover:bg-[var(--color-sand)]"
    >
      Plan this trip
    </Link>
  );
}

const welcomeMessage: UIMessage = {
  id: "roam-welcome",
  role: "assistant",
  parts: [{ type: "text", text: ROAM_WELCOME_MESSAGE }],
};

const STICK_TO_BOTTOM_THRESHOLD_PX = 96;

export function RoamChat() {
  const searchParams = useSearchParams();
  const countryFromUrl = searchParams.get("country")?.trim() ?? "";
  const [input, setInput] = useState(() =>
    countryFromUrl ? roamActivitiesPrompt(countryFromUrl) : "",
  );
  const [stickToBottom, setStickToBottom] = useState(true);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const seededFromUrl = useRef(Boolean(countryFromUrl));

  useEffect(() => {
    if (seededFromUrl.current) return;
    const country = searchParams.get("country")?.trim();
    if (!country) return;
    setInput(roamActivitiesPrompt(country));
    seededFromUrl.current = true;
  }, [searchParams]);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/roam" }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: [welcomeMessage],
  });

  const isBusy = status === "submitted" || status === "streaming";
  const threadDestination = useMemo(
    () => resolveThreadDestination(messages, countryFromUrl),
    [messages, countryFromUrl],
  );
  const showStickyBar =
    Boolean(threadDestination) &&
    (messages.length > 1 || Boolean(countryFromUrl));

  const scrollMessagesToBottom = (behavior: ScrollBehavior = "smooth") => {
    const el = messagesScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };

  const handleMessagesScroll = () => {
    const el = messagesScrollRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    setStickToBottom(distanceFromBottom < STICK_TO_BOTTOM_THRESHOLD_PX);
  };

  useEffect(() => {
    if (!stickToBottom) return;
    scrollMessagesToBottom(isBusy ? "auto" : "smooth");
  }, [messages, status, stickToBottom, isBusy]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    setStickToBottom(true);
    sendMessage({ text });
    setInput("");
    requestAnimationFrame(() => scrollMessagesToBottom("auto"));
  };

  return (
    <div className="flex h-[min(640px,calc(100dvh-13rem))] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm lg:h-[min(760px,calc(100dvh-10rem))]">
      <div
        ref={messagesScrollRef}
        onScroll={handleMessagesScroll}
        className="flex-1 min-h-0 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 lg:mx-auto lg:w-full lg:max-w-3xl"
      >
        {messages.map((message, messageIndex) => {
          const text = messageText(message);
          if (!text) return null;

          if (message.role === "user") {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[min(100%,36rem)] rounded-2xl bg-[var(--color-ocean)] px-4 py-3 text-sm leading-relaxed text-white">
                  <p className="whitespace-pre-wrap">{text}</p>
                </div>
              </div>
            );
          }

          const { ideas, summary, looksIncomplete } =
            parseRoamAssistantReply(text);
          const ideaBubbles = ideas.length > 0 ? ideas : [text];
          const isWelcome = message.id === welcomeMessage.id;
          const isLatestAssistantReply = messageIndex === messages.length - 1;
          const replyComplete = !isBusy || !isLatestAssistantReply;
          const destination = resolveDestinationUpTo(
            messages,
            messageIndex,
            countryFromUrl,
          );
          const planNotes = planNotesFromMessage(text);

          return (
            <div key={message.id} className="space-y-3">
              {ideaBubbles.map((idea, index) => (
                <RoamBubble key={`${message.id}-idea-${index}`} showRoamLabel={index === 0}>
                  <p className="whitespace-pre-wrap">{idea}</p>
                </RoamBubble>
              ))}
              {summary.length > 0 ? (
                <RoamBubble variant="summary">
                  <ul className="space-y-1.5">
                    {summary.map((line, index) => (
                      <li key={`${message.id}-summary-${index}`}>{line}</li>
                    ))}
                  </ul>
                </RoamBubble>
              ) : null}
              {!isWelcome && replyComplete && destination ? (
                <div className="flex justify-start">
                  <PlanThisTripButton
                    destination={destination}
                    notes={planNotes}
                  />
                </div>
              ) : null}
              {replyComplete && isLatestAssistantReply && looksIncomplete ? (
                <p className="text-xs text-[var(--color-muted)]">
                  Roam&apos;s reply may have cut off. Send &ldquo;Please
                  continue&rdquo; to get the rest.
                </p>
              ) : null}
            </div>
          );
        })}

        {isBusy ? (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-sand)]/50 px-4 py-3 text-sm text-[var(--color-muted)]">
              Roam is thinking…
            </div>
          </div>
        ) : null}

        {error ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {friendlyRoamError(error.message || "")}
          </div>
        ) : null}
      </div>

      {showStickyBar && threadDestination ? (
        <div className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-sand)]/80 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--color-ink)]">
              Planning{" "}
              <span className="font-semibold text-[var(--color-ocean-deep)]">
                {threadDestination}
              </span>
              ?
            </p>
            <Link
              href={buildPlanTripContactHref({ destination: threadDestination })}
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--color-coral)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
            >
              Start your trip
            </Link>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5 lg:px-6"
      >
        <div className="flex flex-col gap-3">
          <label className="flex w-full flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Message Roam
            </span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Where should I go for a relaxed beach trip in March?"
              rows={2}
              disabled={isBusy}
              className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] shadow-sm outline-none ring-[var(--color-ocean)]/40 focus:ring-2 disabled:opacity-60 lg:min-h-[7rem] lg:py-4"
            />
          </label>
          <button
            type="submit"
            disabled={isBusy || !input.trim()}
            className="flex w-full items-center justify-center rounded-xl bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          Roam suggests ideas for inspiration.{" "}
          <Link
            href="/explore-countries"
            className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
          >
            Explore Countries map
          </Link>
        </p>
      </form>
    </div>
  );
}
