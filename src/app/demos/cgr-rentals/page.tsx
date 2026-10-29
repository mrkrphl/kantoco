import { CgrShell } from "@/components/demos/cgr-rentals/Shell";
import { Catalogue } from "@/components/demos/cgr-rentals/Catalogue";

export default function CgrRentalsPage() {
  return (
    <CgrShell current="Catalogue">
      <Catalogue />
    </CgrShell>
  );
}
