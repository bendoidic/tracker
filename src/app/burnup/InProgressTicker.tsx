"use client";

import { useEffect, useState } from "react";
import { Task } from "@/lib/types";
import { ASSIGNEE_COLORS } from "@/lib/assignee-colors";

// One card fills the viewport at rest. Each cycle the track steps up by exactly
// one card height: the move eases in/out over MOVE_MS (current card slides out
// the top while the next follows in from the bottom), then the new card dwells
// for DWELL_MS before the next step.
const CARD_H = 80; // px
const MOVE_MS = 500;
const DWELL_MS = 2000;
const STEP_MS = MOVE_MS + DWELL_MS;

export function InProgressTicker({ tasks }: { tasks: Task[] }) {
  const n = tasks.length;
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Reset to the top whenever the list size changes so the index stays in range.
  useEffect(() => {
    setIndex(0);
  }, [n]);

  // Advance one card per cycle. Skip while paused (hover) or sitting on the
  // wrap-around clone (handled by the snap effect below).
  useEffect(() => {
    if (n <= 1 || paused || index >= n) return;
    const id = setTimeout(() => setIndex((i) => i + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [index, n, paused]);

  // Once the move onto the cloned first card finishes, jump back to the real
  // first card with no transition so the loop is seamless.
  useEffect(() => {
    if (n <= 1 || index !== n) return;
    const id = setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, MOVE_MS);
    return () => clearTimeout(id);
  }, [index, n]);

  // Re-enable the transition the frame after an instant snap.
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  if (n === 0) {
    return (
      <div
        className="flex w-full max-w-xl items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/40"
        style={{ height: CARD_H }}
      >
        <span className="text-sm uppercase tracking-widest text-neutral-600">
          Nothing in progress
        </span>
      </div>
    );
  }

  // Clone the first card at the end so the wrap-around move has somewhere to go.
  const cards = [...tasks, tasks[0]];

  return (
    <div
      className="w-full max-w-xl overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40"
      style={{ height: CARD_H }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        style={{
          transform: `translateY(-${index * CARD_H}px)`,
          transition: animate && !reduce ? `transform ${MOVE_MS}ms ease-in-out` : "none",
        }}
      >
        {cards.map((t, i) => {
          const colors = ASSIGNEE_COLORS[t.assignee];
          return (
            <div
              key={`${t.id}-${i}`}
              className="flex items-center gap-3 px-5"
              style={{ height: CARD_H }}
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
