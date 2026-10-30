import { notFound, redirect } from "next/navigation";
import { CGR_BASE, GOWNS, RETIRED_SLUGS, getGown } from "@/lib/cgr-rentals";
import { CgrShell } from "@/components/demos/cgr-rentals/Shell";
import { GownDetail } from "@/components/demos/cgr-rentals/GownDetail";

export function generateStaticParams() {
  return GOWNS.map((g) => ({ slug: g.slug }));
}

export default async function GownPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  // r7.9.1: a listing that was taken down goes back to the catalogue.
  if (RETIRED_SLUGS.has(slug)) redirect(`${CGR_BASE}#gowns`);
  const gown = getGown(slug);
  if (!gown) notFound();
  // r7.9: an old slug (before the listings were renamed to match their
  // photos) goes to the gown's current page.
  if (gown.slug !== slug) {
    const q = typeof sp.date === "string" ? `?date=${encodeURIComponent(sp.date)}` : "";
    redirect(`${CGR_BASE}/gown/${gown.slug}${q}`);
  }
  // r7.8: "Change" on the reserve page comes back with ?date= so the
  // calendar opens on the dates already picked.
  const initialDate =
    typeof sp.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : "";
  return (
    <CgrShell current="Detail">
      <GownDetail gown={gown} initialDate={initialDate} />
    </CgrShell>
  );
}
