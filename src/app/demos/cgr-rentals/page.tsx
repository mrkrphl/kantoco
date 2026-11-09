import { CgrShell } from "@/components/demos/cgr-rentals/Shell";
import { Catalogue } from "@/components/demos/cgr-rentals/Catalogue";
import { GOWNS, type Gown } from "@/lib/cgr-rentals";
import { listCatalogue, toPublicGown } from "@/lib/cgr-catalogue";

export const dynamic = "force-dynamic";

export default async function CgrRentalsPage() {
  const db = await listCatalogue();
  const items: Gown[] = db.length ? (db.map(toPublicGown) as unknown as Gown[]) : GOWNS;
  return (
    <CgrShell current="Catalogue">
      <Catalogue items={items} />
    </CgrShell>
  );
}
