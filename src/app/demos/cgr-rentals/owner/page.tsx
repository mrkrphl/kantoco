import { CgrShell } from "@/components/demos/cgr-rentals/Shell";
import { OwnerView } from "@/components/demos/cgr-rentals/OwnerView";

export default function OwnerPage() {
  return (
    <CgrShell current="Owner">
      <OwnerView />
    </CgrShell>
  );
}
