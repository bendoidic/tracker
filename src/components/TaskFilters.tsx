"use client";

import { ASSIGNEES, Assignee, STATUSES, Status } from "@/lib/types";
import { ASSIGNEE_COLORS } from "@/lib/assignee-colors";

export type Filters = {
  assignees: Set<Assignee>;
  statuses: Set<Status>;
};

const STATUS_LABEL: Record<Status, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

function StatusChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs capitalize ${
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
      }`}
    >
      {children}
    </button>
  );
}

function AssigneeChip({
  assignee,
  active,
  onClick,
}: {
  assignee: Assignee;
  active: boolean;
  onClick: () => void;
}) {
  const c = ASSIGNEE_COLORS[assignee];
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs capitalize ${active ? c.chipActive : c.chipIdle}`}
    >
      {assignee}
    </button>
  );
}

export function TaskFilters({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {
  function toggleAssignee(a: Assignee) {
    const next = new Set(filters.assignees);
    next.has(a) ? next.delete(a) : next.add(a);
    setFilters({ ...filters, assignees: next });
  }
  function toggleStatus(s: Status) {
    const next = new Set(filters.statuses);
    next.has(s) ? next.delete(s) : next.add(s);
    setFilters({ ...filters, statuses: next });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-neutral-500">Who:</span>
        {ASSIGNEES.map((a) => (
          <AssigneeChip
            key={a}
            assignee={a}
            active={filters.assignees.has(a)}
            onClick={() => toggleAssignee(a)}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-neutral-500">Status:</span>
        {STATUSES.map((s) => (
          <StatusChip key={s} active={filters.statuses.has(s)} onClick={() => toggleStatus(s)}>
            {STATUS_LABEL[s]}
          </StatusChip>
        ))}
      </div>
      {(filters.assignees.size > 0 || filters.statuses.size > 0) && (
        <button
          onClick={() => setFilters({ assignees: new Set(), statuses: new Set() })}
          className="text-xs text-neutral-500 underline hover:text-neutral-800"
        >
          clear
        </button>
      )}
    </div>
  );
}
