import { Status, Task } from "./types";

// In progress → To do → Done.
function statusRank(s: Status): number {
  return s === "in_progress" ? 0 : s === "todo" ? 1 : 2;
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const sa = statusRank(a.status);
    const sb = statusRank(b.status);
    if (sa !== sb) return sa - sb;

    if (a.status === "done") {
      // most recently completed first; tasks missing completed_at fall to the bottom
      const ad = a.completed_at ? new Date(a.completed_at).getTime() : 0;
      const bd = b.completed_at ? new Date(b.completed_at).getTime() : 0;
      return bd - ad;
    }

    // soonest deadline first; no-deadline tasks fall to the bottom of their group
    const ad = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const bd = b.deadline ? new Date(b.deadline).getTime() : Infinity;
    if (ad !== bd) return ad - bd;
    // tie-break: newer tasks first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
