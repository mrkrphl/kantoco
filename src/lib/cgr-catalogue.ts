/**
 * r9: catalogue types and loaders. Public pages read available items from the
 * DB (list_catalogue / get_catalogue_item). Owners write through RPCs. Photos
 * are either existing /demos/cgr-rentals/… paths or public Storage URLs in the
 * cgr-catalogue bucket. No prices are invented here.
 */

import { createClient } from "@supabase/supabase-js";

export const CATALOGUE_BUCKET = "cgr-catalogue";

export type ItemType = "gown" | "filipiniana" | "barong_suit" | "kids" | "accessory";
export type ItemStatus = "available" | "paused";

export type CataloguePhoto = {
  path: string;
  alt: string;
  w: number;
  h: number;
};

export type CatalogueItem = {
  slug: string;
  name: string;
  item_type: ItemType;
  colors: string[];
  sizes: string[];
  occasions: string[];
  price_per_day: number | null;
  blurb: string;
  notes: string;
  photos: CataloguePhoto[];
  status: ItemStatus;
  updated_at?: string;
};

export const ITEM_TYPES: { id: ItemType; label: string }[] = [
  { id: "gown", label: "Gown" },
  { id: "filipiniana", label: "Filipiniana" },
  { id: "barong_suit", label: "Barong / Suit" },
  { id: "kids", label: "Kids" },
  { id: "accessory", label: "Accessory" },
];

export function itemTypeLabel(t: string): string {
  return ITEM_TYPES.find((x) => x.id === t)?.label ?? t;
}

/** Turn a DB catalogue row into the shape the public gown pages already use. */
export function toPublicGown(item: CatalogueItem) {
  const category =
    item.item_type === "accessory"
      ? "accessory"
      : item.item_type === "filipiniana"
        ? "filipiniana"
        : item.occasions[0]?.toLowerCase() === "bridal"
          ? "bridal"
          : item.occasions[0]?.toLowerCase() === "debut"
            ? "debut"
            : item.occasions[0]?.toLowerCase() === "pageant"
              ? "pageant"
              : "formal";
  return {
    slug: item.slug,
    name: item.name,
    category: category as "debut" | "pageant" | "formal" | "bridal" | "filipiniana" | "accessory",
    colors: item.colors as ("red" | "blue" | "purple" | "green" | "silver" | "gold" | "mixed")[],
    sizes: item.sizes as ("XS" | "S" | "M" | "L" | "XL" | "One size")[],
    // 0 means "ask the shop" on the public site when the owner left price blank.
    pricePerDay: item.price_per_day ?? 0,
    blurb: item.blurb,
    images: (item.photos ?? []).map((p) => {
      const isAsset = p.path.startsWith("/demos/cgr-rentals/");
      const file = isAsset
        ? p.path.replace(/^\/demos\/cgr-rentals\//, "").replace(/\.webp$/, "")
        : p.path;
      return {
        file,
        alt: p.alt,
        w: p.w,
        h: p.h,
        path: isAsset ? undefined : p.path,
      };
    }),
    itemType: item.item_type,
    occasions: item.occasions,
    notes: item.notes,
    status: item.status,
    bookedDates: [] as string[],
    sample: true,
  };
}

function anon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function listCatalogue(): Promise<CatalogueItem[]> {
  const sb = anon();
  if (!sb) return [];
  const { data, error } = await sb.rpc("list_catalogue");
  if (error || !data) return [];
  return (data as CatalogueItem[]).map(normalizeItem);
}

export async function getCatalogueItem(slug: string): Promise<CatalogueItem | null> {
  const sb = anon();
  if (!sb) return null;
  const { data, error } = await sb.rpc("get_catalogue_item", { p_slug: slug });
  if (error || !data) return null;
  return normalizeItem(data as CatalogueItem);
}

export async function gownFreeOn(slug: string, event: string, ret: string): Promise<boolean | null> {
  const sb = anon();
  if (!sb) return null;
  const { data, error } = await sb.rpc("gown_free_on", { p_slug: slug, p_event: event, p_return: ret });
  if (error) return null;
  return Boolean(data);
}

function normalizeItem(raw: CatalogueItem): CatalogueItem {
  const photos = Array.isArray(raw.photos) ? raw.photos : [];
  return {
    slug: raw.slug,
    name: raw.name,
    item_type: raw.item_type,
    colors: raw.colors ?? [],
    sizes: raw.sizes ?? [],
    occasions: raw.occasions ?? [],
    price_per_day: raw.price_per_day ?? null,
    blurb: raw.blurb ?? "",
    notes: raw.notes ?? "",
    photos: photos.map((p) => ({
      path: p.path,
      alt: p.alt || raw.name,
      w: Number(p.w) || 800,
      h: Number(p.h) || 1200,
    })),
    status: raw.status === "paused" ? "paused" : "available",
    updated_at: raw.updated_at,
  };
}

/** Slug from a name: lowercase, hyphens, 2–60 chars. */
export function slugify(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s.length >= 2 ? s : `item-${Date.now().toString(36).slice(-6)}`;
}

/**
 * Compress a phone photo in the browser before upload. Returns a webp Blob
 * under ~1.2 MB when possible. No server round-trip.
 */
export async function compressPhoto(file: File, maxEdge = 1600, quality = 0.82): Promise<{ blob: Blob; w: number; h: number }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("compress failed"))), "image/webp", quality);
  });
  return { blob, w, h };
}

/** Attribution source captured on reserve (UTM / shop link). */
export type BookingSource = "ad" | "facebook" | "messenger" | "qr" | "direct" | "other";

export function sourceFromSearch(params: URLSearchParams): {
  source: BookingSource;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
} {
  const utm_source = (params.get("utm_source") || "").slice(0, 80);
  const utm_medium = (params.get("utm_medium") || "").slice(0, 80);
  const utm_campaign = (params.get("utm_campaign") || "").slice(0, 120);
  const raw = (params.get("src") || utm_source || "").toLowerCase();
  let source: BookingSource = "direct";
  if (raw === "qr" || utm_medium === "qr") source = "qr";
  else if (raw.includes("facebook") || utm_source.includes("facebook") || utm_medium === "social") source = "facebook";
  else if (raw.includes("messenger") || utm_source.includes("messenger")) source = "messenger";
  else if (raw === "ad" || utm_medium === "cpc" || utm_medium === "paid") source = "ad";
  else if (utm_source) source = "other";
  return { source, utm_source, utm_medium, utm_campaign };
}

/** Monthly commission math (admin only). Kept pure for tests. */
export function monthlyCommission(count: number, per = 200): { count: number; per_php: number; total_php: number } {
  const n = Math.max(0, Math.floor(count));
  return { count: n, per_php: per, total_php: n * per };
}

/** Deletion guard: live bookings block remove. */
export function canRemoveGown(liveStatuses: string[]): boolean {
  return !liveStatuses.some((s) => s === "pending" || s === "confirmed" || s === "out");
}
