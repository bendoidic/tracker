"use client";

import { useState } from "react";
import { ASSIGNEES, Assignee, Task } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { ASSIGNEE_COLORS } from "@/lib/assignee-colors";

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function StretchTaskRow({ task }: { task: Task }) {
  const [title, setTitle] = useState(task.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [busy, setBusy] = useState(false);

  async function update(patch: Partial<Task>) {
    await supabase().from("tasks").update(patch).eq("id", task.id);
  }

  // Promote: drop the stretch flag so it joins the list and burn-up. Reset
  // created_at to now so scope rises at promotion time, not retroactively.
  async function promote() {
    setBusy(true);
    await supabase()
      .from("tasks")
      .update({ stretch: false, created_at: new Date().toISOString() })
      .eq("id", task.id);
    // Realtime will remove it from this screen; no local state needed.
  }

  async function remove() {
    if (!confirm(`Delete "${task.title}"?`)) return;
    await supabase().from("tasks").delete().eq("id", task.id);
  }

  const overdue = task.deadline && new Date(task.deadline) < new Date();
  const colors = ASSIGNEE_COLORS[task.assignee];

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-3 text-sm ${colors.row}`}
    >
      <button
        onClick={promote}
        disabled={busy}
        className="rounded bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        title="Add this task to the list and burn-up"
      >
        {busy ? "Adding…" : "Add"}
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
          className="flex-1 min-w-[12rem] text-left"
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
