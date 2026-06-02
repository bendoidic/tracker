"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Task } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { NewTaskRow } from "@/components/NewTaskRow";
import { TaskRow } from "@/components/TaskRow";
import { Filters, TaskFilters } from "@/components/TaskFilters";
import { sortTasks } from "@/lib/sort-tasks";

export default function ListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    assignees: new Set(),
    statuses: new Set(),
  });

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase()
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setTasks(data as Task[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
    const ch = supabase()
      .channel("tasks-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        fetchTasks();
      })
      .subscribe();
    return () => {
      supabase().removeChannel(ch);
    };
  }, [fetchTasks]);

  const filtered = useMemo(() => {
    const visible = tasks.filter((t) => {
      if (filters.assignees.size > 0 && !filters.assignees.has(t.assignee)) return false;
      if (filters.statuses.size > 0 && !filters.statuses.has(t.status)) return false;
      return true;
    });
    return sortTasks(visible);
  }, [tasks, filters]);

  return (
    <div className="space-y-4">
      <NewTaskRow onCreated={fetchTasks} />
      <TaskFilters filters={filters} setFilters={setFilters} />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {tasks.length === 0 ? "No tasks yet. Add one above or bulk-paste on the Bulk add page." : "No tasks match the current filters."}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </div>
      )}
    </div>
  );
}
