"use server";

import { revalidatePath } from "next/cache";
import { CGR_BASE } from "@/lib/cgr-rentals";
import { CATALOGUE_BUCKET, type CataloguePhoto, type ItemStatus, type ItemType } from "@/lib/cgr-catalogue";
import { ownerSession } from "@/lib/cgr-supabase";

type Ok = { ok: true; photo?: CataloguePhoto };
type Err = { ok: false; error: string };
type Res = Ok | Err;

function err(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (m.includes("cgr:not_owner")) return "Sign in as an active owner to manage the catalogue.";
  if (m.includes("cgr:has_bookings")) return "This item has a live booking. Pause it instead of removing.";
  if (m.includes("cgr:not_found")) return "That item is gone.";
  if (m.includes("cgr:bad_")) return "Check the fields and try again.";
  return "Something went wrong. Nothing was changed.";
}

async function ownerClient() {
  const s = await ownerSession();
  if (s.state !== "owner") return null;
  return s;
}

export async function upsertGown(input: {
  slug: string;
  name: string;
  item_type: ItemType;
  colors: string[];
  sizes: string[];
  occasions: string[];
  price: number | null;
  blurb: string;
  notes: string;
  photos: CataloguePhoto[];
  status: ItemStatus;
}): Promise<Res> {
  const s = await ownerClient();
  if (!s) return { ok: false, error: "Sign in to manage the catalogue." };
  const { error } = await s.sb.rpc("owner_upsert_gown", {
    p_slug: input.slug,
    p_name: input.name,
    p_item_type: input.item_type,
    p_colors: input.colors,
    p_sizes: input.sizes,
    p_occasions: input.occasions,
    p_price: input.price,
    p_blurb: input.blurb,
    p_notes: input.notes,
    p_photos: input.photos,
    p_status: input.status,
  });
  if (error) return { ok: false, error: err(error) };
  revalidatePath(`${CGR_BASE}/owner/catalogue`);
  revalidatePath(CGR_BASE);
  return { ok: true };
}

export async function setGownStatus(slug: string, status: ItemStatus): Promise<Res> {
  const s = await ownerClient();
  if (!s) return { ok: false, error: "Sign in to manage the catalogue." };
  const { error } = await s.sb.rpc("owner_set_gown_status", { p_slug: slug, p_status: status });
  if (error) return { ok: false, error: err(error) };
  revalidatePath(`${CGR_BASE}/owner/catalogue`);
  revalidatePath(CGR_BASE);
  return { ok: true };
}

export async function removeGown(slug: string): Promise<Res> {
  const s = await ownerClient();
  if (!s) return { ok: false, error: "Sign in to manage the catalogue." };
  const { error } = await s.sb.rpc("owner_remove_gown", { p_slug: slug });
  if (error) return { ok: false, error: err(error) };
  revalidatePath(`${CGR_BASE}/owner/catalogue`);
  revalidatePath(CGR_BASE);
  return { ok: true };
}

/** Upload a compressed photo (webp) to the free cgr-catalogue bucket. */
export async function uploadCataloguePhoto(form: FormData): Promise<Res> {
  const s = await ownerClient();
  if (!s) return { ok: false, error: "Sign in to upload photos." };
  const file = form.get("file");
  const slug = String(form.get("slug") || "item");
  const w = Number(form.get("w") || 800);
  const h = Number(form.get("h") || 1200);
  if (!(file instanceof File)) return { ok: false, error: "No photo received." };
  const safe = slug.replace(/[^a-z0-9-]/g, "").slice(0, 40) || "item";
  const path = `${safe}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.byteLength > 5 * 1024 * 1024) {
    return { ok: false, error: "That photo is over the free plan's 5 MB limit after compression." };
  }
  const { error } = await s.sb.storage.from(CATALOGUE_BUCKET).upload(path, buf, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) return { ok: false, error: "Upload failed. Try a smaller photo." };
  const { data } = s.sb.storage.from(CATALOGUE_BUCKET).getPublicUrl(path);
  return {
    ok: true,
    photo: { path: data.publicUrl, alt: safe, w: w || 800, h: h || 1200 },
  };
}
