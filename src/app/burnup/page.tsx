import { BurnupChart } from "./BurnupChart";

export const dynamic = "force-dynamic";

export default async function BurnupPage({
  searchParams,
}: {
  searchParams: Promise<{ target?: string }>;
}) {
  const { target } = await searchParams;
  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-50">
      <BurnupChart target={target ?? null} />
    </div>
  );
}
