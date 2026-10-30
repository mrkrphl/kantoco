import { notFound, redirect } from "next/navigation";
import { CGR_BASE, GOWNS, getGown } from "@/lib/cgr-rentals";
import { CgrShell } from "@/components/demos/cgr-rentals/Shell";
import { ReserveForm } from "@/components/demos/cgr-rentals/ReserveForm";

export function generateStaticParams() {
  return GOWNS.map((g) => ({ slug: g.slug }));
}

export default async function ReservePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const gown = getGown(slug);
  if (!gown) notFound();
  // r7.9: an old slug (before the listings were renamed to match their
  // photos) goes to the gown's current page.
  if (gown.slug !== slug) {
    const q = typeof sp.date === "string" ? `?date=${encodeURIComponent(sp.date)}` : "";
    redirect(`${CGR_BASE}/reserve/${gown.slug}${q}`);
  }
  // Client fills a default (today + 7) when no valid ?date= is given.
  const initialDate =
    typeof sp.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.date)
      ? sp.date
      : "";
  return (
    <CgrShell current="Reserve">
      <ReserveForm gown={gown} initialDate={initialDate} />
    </CgrShell>
  );
}
