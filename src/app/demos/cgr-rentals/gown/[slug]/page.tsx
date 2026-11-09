import { notFound, redirect } from "next/navigation";
import { CGR_BASE, GOWNS, RETIRED_SLUGS, getGown, type Gown } from "@/lib/cgr-rentals";
import { CgrShell } from "@/components/demos/cgr-rentals/Shell";
import { GownDetail } from "@/components/demos/cgr-rentals/GownDetail";
import { getCatalogueItem, listCatalogue, toPublicGown } from "@/lib/cgr-catalogue";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
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
  if (RETIRED_SLUGS.has(slug)) redirect(`${CGR_BASE}#gowns`);
  const dbItem = await getCatalogueItem(slug);
  let gown: Gown | undefined = dbItem ? (toPublicGown(dbItem) as unknown as Gown) : getGown(slug);
  if (!gown) {
    // Try alias / retired mapping via hardcoded, then DB list
    const all = await listCatalogue();
    gown = all.map(toPublicGown).find((g) => g.slug === slug) as unknown as Gown | undefined;
  }
  if (!gown) notFound();
  if (gown.slug !== slug) {
    const qp = new URLSearchParams();
    for (const k of ["date", "from", "to"] as const) {
      const v = sp[k];
      if (typeof v === "string") qp.set(k, v);
    }
    const q = qp.size ? `?${qp.toString()}` : "";
    redirect(`${CGR_BASE}/gown/${gown.slug}${q}`);
  }
  const initialDate = isIso(sp.from) ? sp.from : isIso(sp.date) ? sp.date : "";
  const initialReturn = isIso(sp.to) ? sp.to : "";
  return (
    <CgrShell current="Detail">
      <GownDetail gown={gown} initialDate={initialDate} initialReturn={initialReturn} />
    </CgrShell>
  );
}
