import { CgrShell } from "@/components/demos/cgr-rentals/Shell";
import { Confirmation } from "@/components/demos/cgr-rentals/Confirmation";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const sp = await searchParams;
  const refCode = typeof sp.ref === "string" ? sp.ref : "";
  return (
    <CgrShell current="Confirm">
      <Confirmation refCode={refCode} />
    </CgrShell>
  );
}
