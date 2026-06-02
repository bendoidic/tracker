"use client";

import { ParsedTask } from "@/lib/parse-bulk";

export function BulkParserPreview({ parsed }: { parsed: ParsedTask[] }) {
  if (parsed.length === 0) {
    return <p className="text-sm text-neutral-500">Nothing to preview yet.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Assignee</th>
            <th className="px-3 py-2">Deadline</th>
            <th className="px-3 py-2">Warnings</th>
          </tr>
        </thead>
        <tbody>
          {parsed.map((p) => (
            <tr key={p.lineNumber} className="border-t border-neutral-100">
              <td className="px-3 py-2 text-neutral-400">{p.lineNumber}</td>
              <td className="px-3 py-2">{p.title || <em className="text-neutral-400">(empty)</em>}</td>
              <td className="px-3 py-2 capitalize">{p.assignee}</td>
              <td className="px-3 py-2">{p.deadline ? new Date(p.deadline).toLocaleString() : "—"}</td>
              <td className="px-3 py-2 text-xs text-amber-700">{p.warnings.join("; ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
