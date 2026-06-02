"use client";

import { useEffect, useState } from "react";
import { ASSIGNEES, Assignee } from "@/lib/types";

const STORAGE_KEY = "tracker:whoami";

// Read once. Components that need to react to changes should listen to the storage event.
export function getWhoAmI(): Assignee | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return (ASSIGNEES as readonly string[]).includes(v ?? "") ? (v as Assignee) : null;
}

export function setWhoAmI(a: Assignee) {
  window.localStorage.setItem(STORAGE_KEY, a);
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: a }));
}

export function useWhoAmI(): [Assignee | null, (a: Assignee) => void] {
  const [who, setWho] = useState<Assignee | null>(null);
  useEffect(() => {
    setWho(getWhoAmI());
    const onChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setWho(getWhoAmI());
    };
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, []);
  return [who, (a: Assignee) => { setWhoAmI(a); setWho(a); }];
}

export function WhoAmI() {
  const [who, set] = useWhoAmI();
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-neutral-500">I am</span>
      <select
        value={who ?? ""}
        onChange={(e) => set(e.target.value as Assignee)}
        className="rounded border border-neutral-300 bg-white px-2 py-1 capitalize"
      >
        <option value="" disabled>Pick…</option>
        {ASSIGNEES.map((a) => (
          <option key={a} value={a} className="capitalize">{a}</option>
        ))}
      </select>
    </div>
  );
}
