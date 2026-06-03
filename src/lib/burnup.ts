import { Task } from "./types";

export type BurnupPoint = {
  ts: number;       // epoch ms at hour start, used for x-axis ordering
  x: number;        // compressed-time coordinate; off-peak hours advance it less
  label: string;    // human-readable "MM-DD HH:00"
  scope: number;
  done: number;
};

// Work day runs 09:00–18:00. Hours outside that window rarely see task churn,
// so they advance the x-axis at a fraction of the width to keep them visible
// without dominating the chart.
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
const OFF_PEAK_WIDTH = 0.25;

function hourWidth(d: Date): number {
  const h = d.getHours();
  return h >= WORK_START_HOUR && h < WORK_END_HOUR ? 1 : OFF_PEAK_WIDTH;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function hourLabel(d: Date): string {
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:00`;
}

function floorToHour(d: Date): Date {
  const out = new Date(d);
  out.setMinutes(0, 0, 0);
  return out;
}

function addHours(d: Date, n: number): Date {
  const out = new Date(d);
  out.setHours(out.getHours() + n);
  return out;
}

export function burnupSeries(tasks: Task[], now: Date = new Date()): BurnupPoint[] {
  const endHour = floorToHour(now);
  if (tasks.length === 0) {
    return [{ ts: endHour.getTime(), x: 0, label: hourLabel(endHour), scope: 0, done: 0 }];
  }

  const earliest = tasks.reduce((min, t) => {
    const c = new Date(t.created_at);
    return c < min ? c : min;
  }, new Date(tasks[0].created_at));
  const start = floorToHour(earliest);

  const series: BurnupPoint[] = [];
  let x = 0;
  for (let cur = start; cur <= endHour; cur = addHours(cur, 1)) {
    // count anything that happened during this hour or earlier
    const cutoff = new Date(cur);
    cutoff.setMinutes(59, 59, 999);
    let scope = 0;
    let done = 0;
    for (const t of tasks) {
      if (new Date(t.created_at) <= cutoff) scope += 1;
      if (t.completed_at && new Date(t.completed_at) <= cutoff) done += 1;
    }
    series.push({ ts: cur.getTime(), x, label: hourLabel(cur), scope, done });
    // advance the compressed axis by this hour's width
    x += hourWidth(cur);
  }
  return series;
}
