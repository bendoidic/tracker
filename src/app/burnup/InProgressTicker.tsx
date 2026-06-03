"use client";

import { Task } from "@/lib/types";
import { ASSIGNEE_COLORS } from "@/lib/assignee-colors";

// A vertical, continuously-looping carousel of the team's in-progress work.
// Hovering the viewport pauses the scroll (see globals.css .ticker-viewport).
export function InProgressTicker({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-28 w-full max-w-xl items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/40">
        <span className="text-sm uppercase tracking-widest text-neutral-600">
          Nothing in progress
        </span>
      </div>
    );
  }

  // Two identical copies so the -50% translate loops seamlessly.
  const loop = [...tasks, ...tasks];
  // Roughly 3.5s of dwell per card; min keeps a single card from racing.
  const durationSec = Math.max(8, tasks.length * 3.5);

  return (
    <div className="ticker-viewport relative h-28 w-full max-w-xl overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40">
      {/* top/bottom fade so cards slide in and out softly */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-neutral-950 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-neutral-950 to-transparent" />

      <div className="ticker-track px-4 py-2" style={{ animationDuration: `${durationSec}s` }}>
        {loop.map((t, i) => {
          const colors = ASSIGNEE_COLORS[t.assignee];
          return (
            <div
              key={`${t.id}-${i}`}
              className="mb-3 flex items-center gap-3 rounded-lg bg-neutral-800/70 px-4 py-3"
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${colors.dot}`} />
              <span className="truncate text-lg font-medium text-neutral-50">{t.title}</span>
              <span className="ml-auto shrink-0 text-xs uppercase tracking-wider text-neutral-400">
                {t.assignee}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
