"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { Task } from "@/lib/types";
import { burnupSeries } from "@/lib/burnup";
import { InProgressTicker } from "./InProgressTicker";

export function BurnupChart({ target }: { target: string | null }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase()
      .from("tasks")
      .select("*")
      .eq("stretch", false)
      .order("created_at", { ascending: true });
    if (data) setTasks(data as Task[]);
  }, []);

  useEffect(() => {
    fetchTasks();

    const ch = supabase()
      .channel("tasks-burnup")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        fetchTasks();
      })
      .subscribe();

    // Belt-and-braces 60s poll in case the WebSocket drops overnight.
    const id = setInterval(fetchTasks, 60_000);

    return () => {
      supabase().removeChannel(ch);
      clearInterval(id);
    };
  }, [fetchTasks]);

  const series = useMemo(() => burnupSeries(tasks), [tasks]);
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const inProgress = useMemo(
    () => tasks.filter((t) => t.status === "in_progress"),
    [tasks]
  );

  // The x-axis is in compressed time, so map each x back to its hour label.
  const labelByX = useMemo(
    () => new Map(series.map((p) => [p.x, p.label])),
    [series]
  );

  // Evenly-spaced ticks across the compressed axis. Because off-peak hours are
  // narrower, work hours naturally get more labels.
  const ticks = useMemo(() => {
    if (series.length === 0) return [];
    const maxX = series[series.length - 1].x;
    if (maxX === 0) return [series[0].x];
    const COUNT = 8;
    const chosen = new Set<number>();
    for (let i = 0; i < COUNT; i++) {
      const targetX = (maxX * i) / (COUNT - 1);
      let best = series[0];
      for (const p of series) {
        if (Math.abs(p.x - targetX) < Math.abs(best.x - targetX)) best = p;
      }
      chosen.add(best.x);
    }
    return [...chosen].sort((a, b) => a - b);
  }, [series]);

  const daysLeft = useMemo(() => {
    if (!target) return null;
    const t = new Date(target);
    if (Number.isNaN(t.getTime())) return null;
    const now = new Date();
    const diff = Math.ceil((t.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [target]);

  return (
    <div className="flex h-full w-full flex-col p-8">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/team-lego-logo-light.png" alt="Team Lego" className="h-12 w-auto shrink-0" />

        <div className="flex justify-center">
          <InProgressTicker tasks={inProgress} />
        </div>

        <div className="flex items-baseline gap-8 text-2xl">
          <Stat label="total" value={String(total)} />
          <Stat label="done" value={String(done)} accent="text-green-400" />
          <Stat label="progress" value={`${pct}%`} />
          {daysLeft !== null && (
            <Stat
              label="days left"
              value={String(daysLeft)}
              accent={daysLeft <= 7 ? "text-red-400" : daysLeft <= 21 ? "text-amber-300" : "text-neutral-100"}
            />
          )}
        </div>
      </div>

      <div className="mt-6 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="doneFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="scopeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#737373" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#737373" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis
              dataKey="x"
              type="number"
              domain={["dataMin", "dataMax"]}
              ticks={ticks}
              tickFormatter={(x: number) => labelByX.get(x) ?? ""}
              stroke="#a3a3a3"
              tick={{ fontSize: 14 }}
            />
            <YAxis stroke="#a3a3a3" tick={{ fontSize: 14 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#171717", border: "1px solid #404040", color: "#fafafa" }}
              labelStyle={{ color: "#fafafa" }}
              labelFormatter={(x: number) => labelByX.get(x) ?? ""}
            />
            <Area
              type="monotone"
              dataKey="scope"
              stroke="#a3a3a3"
              strokeWidth={2}
              fill="url(#scopeFill)"
              name="Scope"
            />
            <Area
              type="monotone"
              dataKey="done"
              stroke="#34d399"
              strokeWidth={4}
              fill="url(#doneFill)"
              name="Done"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "text-neutral-100",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col items-end">
      <span className={`text-5xl font-bold ${accent}`}>{value}</span>
      <span className="text-xs uppercase tracking-wider text-neutral-400">{label}</span>
    </div>
  );
}
