import { notFound, redirect } from "next/navigation";
import { CGR_BASE, GOWNS, RETIRED_SLUGS, getGown } from "@/lib/cgr-rentals";
import { CgrShell } from "@/components/demos/cgr-rentals/Shell";
import { GownDetail } from "@/components/demos/cgr-rentals/GownDetail";

export function generateStaticParams() {
  return GOWNS.map((g) => ({ slug: g.slug }));
}

const isIso = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export default async function GownPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string; from?: string; to?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  // r7.9.1: a listing that was taken down goes back to the catalogue.
  if (RETIRED_SLUGS.has(slug)) redirect(`${CGR_BASE}#gowns`);
  const gown = getGown(slug);
  if (!gown) notFound();
  // r7.9: an old slug goes to the gown's current page, keeping its dates.
  if (gown.slug !== slug) {
    const qp = new URLSearchParams();
    for (const k of ["date", "from", "to"] as const) {
      const v = sp[k];
      if (typeof v === "string") qp.set(k, v);
    }
    const q = qp.size ? `?${qp.toString()}` : "";
    redirect(`${CGR_BASE}/gown/${gown.slug}${q}`);
  }
  // r7.11: dates stay picked as ?from=&to=; the older ?date= still works.
  const initialDate = isIso(sp.from) ? sp.from : isIso(sp.date) ? sp.date : "";
  const initialReturn = isIso(sp.to) ? sp.to : "";
  return (
    <CgrShell current="Detail">
      <GownDetail gown={gown} initialDate={initialDate} initialReturn={initialReturn} />
    </CgrShell>
  );
}
