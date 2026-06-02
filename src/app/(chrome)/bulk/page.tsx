"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWhoAmI } from "@/components/WhoAmI";
import { BulkParserPreview } from "@/components/BulkParserPreview";
import { parseBulk } from "@/lib/parse-bulk";
import { supabase } from "@/lib/supabase";
import { NewTask } from "@/lib/types";

const PLACEHOLDER = `# Section headers and blank lines are skipped.
Set up office wifi @miki !2026-06-10
Order new monitors @ben !2026-06-15 14:30
Draft Q3 roadmap @alex
Reply to investor email @isai !2026-06-05`;

export default function BulkPage() {
  const [who] = useWhoAmI();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const parsed = useMemo(() => parseBulk(text, who ?? "miki"), [text, who]);
  const creatable = parsed.filter((p) => p.title);

  async function submit() {
    if (!who) {
      setError("Pick your name in the top right first.");
      return;
    }
    if (creatable.length === 0) return;
    setBusy(true);
    setError(null);
    const rows: NewTask[] = creatable.map((p) => ({
      title: p.title,
      assignee: p.assignee,
      deadline: p.deadline,
      created_by: who,
    }));
    const { error: err } = await supabase().from("tasks").insert(rows);
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Bulk add</h1>
        <p className="mt-1 text-sm text-neutral-600">
          One task per line. Use <code className="rounded bg-neutral-100 px-1">@miki</code>{" "}
          <code className="rounded bg-neutral-100 px-1">@ben</code>{" "}
          <code className="rounded bg-neutral-100 px-1">@alex</code>{" "}
          <code className="rounded bg-neutral-100 px-1">@isai</code> for assignee, and{" "}
          <code className="rounded bg-neutral-100 px-1">!2026-06-10</code> or{" "}
          <code className="rounded bg-neutral-100 px-1">!2026-06-10 14:30</code> for a deadline.
          Lines starting with <code className="rounded bg-neutral-100 px-1">#</code> or blank lines are skipped.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={12}
        className="w-full rounded-lg border border-neutral-300 bg-white p-3 font-mono text-sm"
      />

      <BulkParserPreview parsed={parsed} />

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={busy || creatable.length === 0 || !who}
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : `Create ${creatable.length} task${creatable.length === 1 ? "" : "s"}`}
        </button>
        {!who && <span className="text-xs text-amber-700">Pick your name first.</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}
