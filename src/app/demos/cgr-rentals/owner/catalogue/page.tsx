import type { Metadata } from "next";
import { CataloguePanel } from "@/components/demos/cgr-rentals/plain/CataloguePanel";
import { PlainShell } from "@/components/demos/cgr-rentals/plain/PlainShell";
import { ownerSession, OWNER_DB_ON } from "@/lib/cgr-supabase";
import type { CatalogueItem } from "@/lib/cgr-catalogue";
import "../../plain.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Catalogue · CGR owner", robots: { index: false, follow: false } };

export default async function OwnerCataloguePage() {
  const s = OWNER_DB_ON ? await ownerSession() : ({ state: "unavailable" } as const);
  if (s.state !== "owner") {
    return (
      <PlainShell page="catalogue" signedIn={false}>
        <div className="sec card wrap">
          <h1>Catalogue</h1>
          <p className="sub">Sign in as an owner to manage gowns and accessories.</p>
        </div>
      </PlainShell>
    );
  }
  const { data, error } = await s.sb.rpc("owner_list_gowns");
  const items = (!error && Array.isArray(data) ? data : []) as CatalogueItem[];
  return (
    <PlainShell page="catalogue" current="catalogue" admin={s.role === "admin"} signedIn>
      <CataloguePanel items={items} />
    </PlainShell>
  );
}
