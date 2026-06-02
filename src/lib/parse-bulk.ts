import { ASSIGNEES, Assignee } from "./types";

export type ParsedTask = {
  lineNumber: number;
  raw: string;
  title: string;
  assignee: Assignee;
  deadline: string | null;
  warnings: string[];
};

const ASSIGNEE_SET = new Set<string>(ASSIGNEES);

// Matches @name where name is any non-space token; we validate against ASSIGNEES below.
const ASSIGNEE_RE = /@([A-Za-z_][A-Za-z0-9_]*)/g;
// Matches !YYYY-MM-DD optionally followed by HH:MM (24h).
const DEADLINE_RE = /!(\d{4}-\d{2}-\d{2})(?:[ T](\d{1,2}:\d{2}))?/g;

export function parseBulk(input: string, fallbackAssignee: Assignee): ParsedTask[] {
  const out: ParsedTask[] = [];
  const lines = input.split(/\r?\n/);

  lines.forEach((rawLine, idx) => {
    const lineNumber = idx + 1;
    const trimmed = rawLine.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("#")) return;

    const warnings: string[] = [];
    let assignee: Assignee | null = null;
    let deadline: string | null = null;

    let working = rawLine;

    // Extract assignee(s)
    const assigneeMatches = [...working.matchAll(ASSIGNEE_RE)];
    for (const m of assigneeMatches) {
      const name = m[1].toLowerCase();
      if (ASSIGNEE_SET.has(name)) {
        if (assignee && assignee !== name) {
          warnings.push(`multiple @assignees; using @${assignee}`);
        } else {
          assignee = name as Assignee;
        }
      } else {
        warnings.push(`unknown @${m[1]}`);
      }
    }
    working = working.replace(ASSIGNEE_RE, "");

    // Extract deadline(s)
    const deadlineMatches = [...working.matchAll(DEADLINE_RE)];
    if (deadlineMatches.length > 1) {
      warnings.push(`multiple !deadlines; using first`);
    }
    if (deadlineMatches.length > 0) {
      const m = deadlineMatches[0];
      const datePart = m[1];
      const timePart = m[2];
      const iso = parseDeadline(datePart, timePart);
      if (iso) {
        deadline = iso;
      } else {
        warnings.push(`invalid deadline !${m[1]}${m[2] ? " " + m[2] : ""}`);
      }
    }
    working = working.replace(DEADLINE_RE, "");

    const title = working.replace(/\s+/g, " ").trim();
    if (!title) {
      warnings.push("empty title; skipped");
      out.push({
        lineNumber,
        raw: rawLine,
        title: "",
        assignee: assignee ?? fallbackAssignee,
        deadline,
        warnings,
      });
      return;
    }

    out.push({
      lineNumber,
      raw: rawLine,
      title,
      assignee: assignee ?? fallbackAssignee,
      deadline,
      warnings,
    });
  });

  return out;
}

// Date-only → EOD local (23:59) as the plan specifies.
function parseDeadline(datePart: string, timePart: string | undefined): string | null {
  const [y, mo, d] = datePart.split("-").map(Number);
  if (!y || !mo || !d) return null;
  let hour = 23;
  let minute = 59;
  if (timePart) {
    const [h, m] = timePart.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    hour = h;
    minute = m;
  }
  const local = new Date(y, mo - 1, d, hour, minute, 0, 0);
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
}
