"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import type { TeamMember } from "@/data/team";
import { teamMembers } from "@/data/team";

type TeamSectionProps = {
  members?: TeamMember[];
};

function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:+${digits}` : undefined;
}

export function TeamSection({ members = teamMembers }: TeamSectionProps) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const toggle = useCallback((id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <ul className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 xl:grid-cols-3 xl:gap-10">
      {members.map((member) => (
        <li key={member.id} className="min-w-0 [perspective:1400px]">
          <FlipCard
            member={member}
            isFlipped={!!flipped[member.id]}
            onToggle={() => toggle(member.id)}
          />
        </li>
      ))}
    </ul>
  );
}

function FlipCard({
  member,
  isFlipped,
  onToggle,
}: {
  member: TeamMember;
  isFlipped: boolean;
  onToggle: () => void;
}) {
  const tel = telHref(member.info.phone);

  /* Fixed height keeps the 3D flip stable; wide landscape feel on md+ */
  return (
    <div className="relative h-[300px] w-full sm:h-[280px] lg:h-[300px] xl:h-[320px]">
      <div
        className={`relative h-full w-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front — horizontal split from sm */}
        <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(0deg)]">
          <button
            type="button"
            onClick={onToggle}
            className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white text-left shadow-sm transition hover:border-[var(--color-ocean)]/40 sm:flex-row"
            aria-expanded={isFlipped}
            aria-label={`${member.name} — show profile`}
          >
            <div className="relative h-[52%] w-full shrink-0 bg-[var(--color-sand-muted)] sm:h-full sm:w-[52%] sm:min-w-0">
              <Image
                src={member.imageSrc}
                alt={member.name}
                fill
                className="object-cover transition group-hover:brightness-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 40vw, 28vw"
              />
            </div>
            <div className="flex min-h-0 flex-1 flex-col justify-center p-4 sm:w-[48%] sm:py-5 sm:pl-3 sm:pr-4">
              <p className="font-serif text-lg font-semibold leading-snug text-[var(--color-ocean-deep)] sm:text-xl">
                {member.name}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{member.role}</p>
              <p className="mt-3 text-xs font-medium text-[var(--color-ocean)]">
                Click to see profile
              </p>
            </div>
          </button>
        </div>

        {/* Back — horizontal: sidebar + scrollable body */}
        <div className="absolute inset-0 h-full w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-sm">
          <div className="flex h-full min-h-0 w-full flex-col overflow-hidden sm:flex-row">
            <div className="flex shrink-0 flex-col items-center border-b border-[var(--color-border)] bg-[var(--color-sand)]/50 px-3 py-4 sm:w-[min(7.5rem,28%)] sm:border-b-0 sm:border-r sm:py-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[var(--color-sand-muted)] ring-2 ring-[var(--color-border)] sm:h-20 sm:w-20">
                <Image
                  src={member.imageSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <h3 className="mt-3 text-center font-serif text-sm font-semibold leading-tight text-[var(--color-ocean-deep)] sm:text-base">
                {member.name}
              </h3>
              <p className="mt-1 text-center text-xs text-[var(--color-ocean)]">
                {member.role}
              </p>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain p-3 sm:p-4">
              <div className="space-y-2 text-xs leading-relaxed text-[var(--color-muted)] sm:text-sm">
                {member.bio.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <div className="mt-4 border-t border-[var(--color-border)] pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ocean)] sm:text-xs">
                  Contact
                </p>
                <a
                  href={`mailto:${member.info.email}`}
                  className="mt-1 block break-all text-xs font-medium text-[var(--color-ocean-deep)] underline-offset-2 hover:underline sm:text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {member.info.email}
                </a>
                {tel ? (
                  <a
                    href={tel}
                    className="mt-1 block text-xs font-medium text-[var(--color-ocean-deep)] underline-offset-2 hover:underline sm:text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {member.info.phone}
                  </a>
                ) : (
                  <p className="mt-1 text-xs text-[var(--color-muted)] sm:text-sm">
                    {member.info.phone}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onToggle}
                className="mt-4 shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-sand)] py-2 text-xs font-semibold text-[var(--color-ocean-deep)] transition hover:bg-[var(--color-sand-muted)] sm:py-2.5 sm:text-sm"
              >
                Flip back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
