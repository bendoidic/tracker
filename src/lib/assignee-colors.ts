import { Assignee } from "./types";

// Static class strings so Tailwind's content scanner picks them up.
export const ASSIGNEE_COLORS: Record<
  Assignee,
  {
    row: string;
    chipIdle: string;
    chipActive: string;
    dot: string;
    chartStroke: string;
  }
> = {
  miki: {
    row: "bg-sky-50 border-sky-200 border-l-4 border-l-sky-400",
    chipIdle: "border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-400",
    chipActive: "border-sky-600 bg-sky-600 text-white",
    dot: "bg-sky-400",
    chartStroke: "#38bdf8",
  },
  ben: {
    row: "bg-amber-50 border-amber-200 border-l-4 border-l-amber-400",
    chipIdle: "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-400",
    chipActive: "border-amber-600 bg-amber-600 text-white",
    dot: "bg-amber-400",
    chartStroke: "#f59e0b",
  },
  alex: {
    row: "bg-violet-50 border-violet-200 border-l-4 border-l-violet-400",
    chipIdle: "border-violet-200 bg-violet-50 text-violet-800 hover:border-violet-400",
    chipActive: "border-violet-600 bg-violet-600 text-white",
    dot: "bg-violet-400",
    chartStroke: "#a78bfa",
  },
  isai: {
    row: "bg-emerald-50 border-emerald-200 border-l-4 border-l-emerald-400",
    chipIdle: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400",
    chipActive: "border-emerald-600 bg-emerald-600 text-white",
    dot: "bg-emerald-400",
    chartStroke: "#34d399",
  },
};
