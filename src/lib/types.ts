export const ASSIGNEES = ["miki", "ben", "alex", "isai"] as const;
export type Assignee = (typeof ASSIGNEES)[number];

export const STATUSES = ["todo", "in_progress", "done"] as const;
export type Status = (typeof STATUSES)[number];

export type Task = {
  id: string;
  title: string;
  assignee: Assignee;
  deadline: string | null;
  status: Status;
  created_at: string;
  completed_at: string | null;
  created_by: Assignee;
};

export type NewTask = {
  title: string;
  assignee: Assignee;
  deadline: string | null;
  created_by: Assignee;
};
