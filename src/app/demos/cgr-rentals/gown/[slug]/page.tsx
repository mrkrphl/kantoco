import { notFound } from "next/navigation";
import { GOWNS, getGown } from "@/lib/cgr-rentals";
import { CgrShell } from "@/components/demos/cgr-rentals/Shell";
import { GownDetail } from "@/components/demos/cgr-rentals/GownDetail";

export function generateStaticParams() {
  return GOWNS.map((g) => ({ slug: g.slug }));
}

export default async function GownPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gown = getGown(slug);
  if (!gown) notFound();
  return (
    <CgrShell current="Detail">
      <GownDetail gown={gown} />
    </CgrShell>
  );
}
