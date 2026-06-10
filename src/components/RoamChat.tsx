"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseRoamAssistantReply } from "@/lib/roam-message-format";
import { ROAM_WELCOME_MESSAGE } from "@/lib/roam-prompt";

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
    lower.includes("rate limit")
  ) {
    return "Roam is temporarily unavailable — the AI quota for today has been used up. Wait a few minutes and try again, or check your Google AI Studio key and usage at aistudio.google.com.";
  }
  if (lower.includes("api key") || lower.includes("401") || lower.includes("403")) {
    return "Roam could not connect — check that GOOGLE_GENERATIVE_AI_API_KEY is set correctly in your environment.";
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

const welcomeMessage: UIMessage = {
  id: "roam-welcome",
  role: "assistant",
  parts: [{ type: "text", text: ROAM_WELCOME_MESSAGE }],
};

const STICK_TO_BOTTOM_THRESHOLD_PX = 96;

export function RoamChat() {
  const [input, setInput] = useState("");
  const [stickToBottom, setStickToBottom] = useState(true);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/roam" }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: [welcomeMessage],
  });

  const isBusy = status === "submitted" || status === "streaming";

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
    <div className="flex h-[min(640px,calc(100dvh-13rem))] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      <div
        ref={messagesScrollRef}
        onScroll={handleMessagesScroll}
        className="flex-1 min-h-0 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
      >
        {messages.map((message) => {
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

          const { ideas, summary } = parseRoamAssistantReply(text);
          const ideaBubbles = ideas.length > 0 ? ideas : [text];

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

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5"
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
              className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] shadow-sm outline-none ring-[var(--color-ocean)]/40 focus:ring-2 disabled:opacity-60"
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
          Roam suggests ideas for inspiration. For bookings and custom
          itineraries,{" "}
          <Link
            href="/contact?topic=plan-trip"
            className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
          >
            talk to Edwards Travel
          </Link>
          {" · "}
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
