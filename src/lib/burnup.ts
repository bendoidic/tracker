import { Task } from "./types";

export type BurnupPoint = {
  ts: number;       // epoch ms at hour start, used for x-axis ordering
  label: string;    // human-readable "MM-DD HH:00"
  scope: number;
  done: number;
};

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
    return [{ ts: endHour.getTime(), label: hourLabel(endHour), scope: 0, done: 0 }];
  }

  const earliest = tasks.reduce((min, t) => {
    const c = new Date(t.created_at);
    return c < min ? c : min;
  }, new Date(tasks[0].created_at));
  const start = floorToHour(earliest);

  const series: BurnupPoint[] = [];
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
    series.push({ ts: cur.getTime(), label: hourLabel(cur), scope, done });
  }
  return series;
}
