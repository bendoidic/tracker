import Link from "next/link";
import { WhoAmI } from "@/components/WhoAmI";

export default function ChromeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold">
            Tracker
          </Link>
          <nav className="flex gap-3 text-sm text-neutral-600">
            <Link href="/" className="hover:text-neutral-900">List</Link>
            <Link href="/bulk" className="hover:text-neutral-900">Bulk add</Link>
            <Link href="/burnup" className="hover:text-neutral-900">Burn-up</Link>
          </nav>
        </div>
        <WhoAmI />
      </header>
      {children}
    </div>
  );
}
