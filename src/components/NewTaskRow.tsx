"use client";

import { useState } from "react";
import { ASSIGNEES, Assignee, NewTask } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useWhoAmI } from "./WhoAmI";

export function NewTaskRow({
  onCreated,
  stretch = false,
}: {
  onCreated?: () => void;
  stretch?: boolean;
}) {
  const [who] = useWhoAmI();
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState<Assignee>(who ?? "miki");
  const [deadline, setDeadline] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!who) {
      setError("Pick your name in the top right first.");
      return;
    }
    const trimmed = title.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    const payload: NewTask = {
      title: trimmed,
      assignee,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      created_by: who,
      stretch,
    };
    const { error: err } = await supabase().from("tasks").insert(payload);
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setTitle("");
    setDeadline("");
    onCreated?.();
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3">
      <input
        type="text"
        placeholder="New task title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 min-w-[14rem] rounded border border-neutral-300 px-2 py-1.5 text-sm"
      />
      <select
        value={assignee}
        onChange={(e) => setAssignee(e.target.value as Assignee)}
        className="rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm capitalize"
      >
        {ASSIGNEES.map((a) => (
          <option key={a} value={a} className="capitalize">{a}</option>
        ))}
      </select>
      <input
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
      />
      <button
        type="submit"
        disabled={busy || !title.trim()}
        className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Adding…" : "Add"}
      </button>
      {error && <span className="basis-full text-xs text-red-600">{error}</span>}
    </form>
  );
}
