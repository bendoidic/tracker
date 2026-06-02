"use client";

import { useState } from "react";
import { ASSIGNEES, Assignee, Status, Task } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { ASSIGNEE_COLORS } from "@/lib/assignee-colors";

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_CYCLE: Record<Status, Status> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

const STATUS_LABEL: Record<Status, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

const STATUS_STYLES: Record<Status, string> = {
  todo: "bg-neutral-100 text-neutral-700",
  in_progress: "bg-amber-100 text-amber-800",
  done: "bg-green-100 text-green-800",
};

export function TaskRow({ task }: { task: Task }) {
  const [title, setTitle] = useState(task.title);
  const [editingTitle, setEditingTitle] = useState(false);

  async function update(patch: Partial<Task>) {
    const next = { ...patch };
    if (patch.status) {
      next.completed_at = patch.status === "done" ? new Date().toISOString() : null;
    }
    await supabase().from("tasks").update(next).eq("id", task.id);
  }

  async function remove() {
    if (!confirm(`Delete "${task.title}"?`)) return;
    await supabase().from("tasks").delete().eq("id", task.id);
  }

  const overdue =
    task.deadline && task.status !== "done" && new Date(task.deadline) < new Date();

  const colors = ASSIGNEE_COLORS[task.assignee];
  const muted = task.status === "done" ? "opacity-60" : "";

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-lg border p-3 text-sm ${colors.row} ${muted}`}
    >
      <button
        onClick={() => update({ status: STATUS_CYCLE[task.status] })}
        className={`rounded px-2 py-1 text-xs font-medium ${STATUS_STYLES[task.status]}`}
        title="Click to advance status"
      >
        {STATUS_LABEL[task.status]}
      </button>

      {editingTitle ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            setEditingTitle(false);
            const t = title.trim();
            if (t && t !== task.title) update({ title: t });
            else setTitle(task.title);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") {
              setTitle(task.title);
              setEditingTitle(false);
            }
          }}
          className="flex-1 min-w-[12rem] rounded border border-neutral-300 px-2 py-1"
        />
      ) : (
        <button
          onClick={() => setEditingTitle(true)}
          className={`flex-1 min-w-[12rem] text-left ${task.status === "done" ? "text-neutral-400 line-through" : ""}`}
        >
          {task.title}
        </button>
      )}

      <select
        value={task.assignee}
        onChange={(e) => update({ assignee: e.target.value as Assignee })}
        className="rounded border border-neutral-300 bg-white px-2 py-1 capitalize"
      >
        {ASSIGNEES.map((a) => (
          <option key={a} value={a} className="capitalize">{a}</option>
        ))}
      </select>

      <input
        type="datetime-local"
        value={toLocalInputValue(task.deadline)}
        onChange={(e) => {
          const v = e.target.value;
          update({ deadline: v ? new Date(v).toISOString() : null });
        }}
        className={`rounded border px-2 py-1 ${overdue ? "border-red-400 text-red-700" : "border-neutral-300"}`}
      />

      <button
        onClick={remove}
        className="text-xs text-neutral-400 hover:text-red-600"
        title="Delete"
      >
        ×
      </button>
    </div>
  );
}
