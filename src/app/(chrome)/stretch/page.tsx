"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Task } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { NewTaskRow } from "@/components/NewTaskRow";
import { StretchTaskRow } from "@/components/StretchTaskRow";
import { sortTasks } from "@/lib/sort-tasks";

export default function StretchPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase()
      .from("tasks")
      .select("*")
      .eq("stretch", true)
      .order("created_at", { ascending: false });
    if (!error && data) setTasks(data as Task[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
    const ch = supabase()
      .channel("tasks-stretch")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        fetchTasks();
      })
      .subscribe();
    return () => {
      supabase().removeChannel(ch);
    };
  }, [fetchTasks]);

  const sorted = useMemo(() => sortTasks(tasks), [tasks]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Stretch</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Stage potential tasks here without affecting the team&apos;s workload. They stay off
          the main list and the burn-up chart until you press{" "}
          <span className="font-medium text-neutral-900">Add</span>.
        </p>
      </div>

      <NewTaskRow onCreated={fetchTasks} stretch />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No stretch tasks yet. Add one above to stage it for later.
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((t) => (
            <StretchTaskRow key={t.id} task={t} />
          ))}
        </div>
      )}
    </div>
  );
}
