import { CgrShell } from "@/components/demos/cgr-rentals/Shell";
import { FittingFlow } from "@/components/demos/cgr-rentals/FittingFlow";

export const metadata = { title: "Book a fitting · Cavite Gown Rentals" };

export default async function FittingPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; gown?: string }>;
}) {
  const sp = await searchParams;
  return (
    <CgrShell current="Fitting">
      <FittingFlow
        refCode={typeof sp.ref === "string" ? sp.ref : ""}
        gownSlug={typeof sp.gown === "string" ? sp.gown : ""}
      />
    </CgrShell>
  );
}
