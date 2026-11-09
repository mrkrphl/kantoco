"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ITEM_TYPES,
  compressPhoto,
  itemTypeLabel,
  slugify,
  type CatalogueItem,
  type CataloguePhoto,
  type ItemStatus,
  type ItemType,
} from "@/lib/cgr-catalogue";
import { CATALOGUE_BUCKET } from "@/lib/cgr-catalogue";
import { plural } from "@/lib/cgr-owner-format";
import {
  removeGown,
  setGownStatus,
  upsertGown,
  uploadCataloguePhoto,
} from "@/app/demos/cgr-rentals/owner/catalogue/actions";

/**
 * r9 owner Catalogue: list, add, edit, pause, remove. Photos compress on the
 * phone before upload to the free Storage bucket. Shown uncropped (contain).
 */

type Draft = {
  slug: string;
  name: string;
  item_type: ItemType;
  colors: string;
  sizes: string;
  occasions: string;
  price: string;
  blurb: string;
  notes: string;
  photos: CataloguePhoto[];
  status: ItemStatus;
};

const empty = (): Draft => ({
  slug: "",
  name: "",
  item_type: "gown",
  colors: "",
  sizes: "",
  occasions: "",
  price: "",
  blurb: "",
  notes: "",
  photos: [],
  status: "available",
});

function fromItem(i: CatalogueItem): Draft {
  return {
    slug: i.slug,
    name: i.name,
    item_type: i.item_type,
    colors: (i.colors ?? []).join(", "),
    sizes: (i.sizes ?? []).join(", "),
    occasions: (i.occasions ?? []).join(", "),
    price: i.price_per_day == null ? "" : String(i.price_per_day),
    blurb: i.blurb ?? "",
    notes: i.notes ?? "",
    photos: i.photos ?? [],
    status: i.status,
  };
}

function splitList(s: string): string[] {
  return s
    .split(/[,|]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function CataloguePanel({ items: initial }: { items: CatalogueItem[] }) {
  const [items, setItems] = useState(initial);
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [draft, setDraft] = useState<Draft>(empty());
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, start] = useTransition();
  const [uploading, setUploading] = useState(false);

  const counts = useMemo(() => {
    const a = items.filter((i) => i.status === "available").length;
    const p = items.length - a;
    return { a, p };
  }, [items]);

  function openAdd() {
    setDraft(empty());
    setMode("add");
    setMsg(null);
  }
  function openEdit(i: CatalogueItem) {
    setDraft(fromItem(i));
    setMode("edit");
    setMsg(null);
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setMsg(null);
    try {
      const next = [...draft.photos];
      for (const file of Array.from(files).slice(0, 6)) {
        const { blob, w, h } = await compressPhoto(file);
        const slug = draft.slug || slugify(draft.name || "item");
        const fd = new FormData();
        fd.set("file", new File([blob], "photo.webp", { type: "image/webp" }));
        fd.set("slug", slug);
        fd.set("w", String(w));
        fd.set("h", String(h));
        const res = await uploadCataloguePhoto(fd);
        if (!res.ok || !res.photo) {
          setMsg({ ok: false, text: (!res.ok && res.error) || "Upload failed." });
          break;
        }
        next.push(res.photo);
      }
      setDraft((d) => ({ ...d, photos: next, slug: d.slug || slugify(d.name || "item") }));
    } catch {
      setMsg({ ok: false, text: "Could not compress that photo. Try another." });
    } finally {
      setUploading(false);
    }
  }

  function save() {
    const name = draft.name.trim();
    if (!name) {
      setMsg({ ok: false, text: "Name is required." });
      return;
    }
    const slug = (draft.slug || slugify(name)).toLowerCase();
    const price = draft.price.trim() === "" ? null : Number(draft.price);
    if (price != null && (!Number.isFinite(price) || price <= 0)) {
      setMsg({ ok: false, text: "Price must be blank or a positive number." });
      return;
    }
    start(async () => {
      const res = await upsertGown({
        slug,
        name,
        item_type: draft.item_type,
        colors: splitList(draft.colors),
        sizes: splitList(draft.sizes),
        occasions: splitList(draft.occasions),
        price,
        blurb: draft.blurb.trim(),
        notes: draft.notes.trim(),
        photos: draft.photos,
        status: draft.status,
      });
      if (!res.ok) {
        setMsg({ ok: false, text: res.ok ? "Could not save." : res.error });
        return;
      }
      const row: CatalogueItem = {
        slug,
        name,
        item_type: draft.item_type,
        colors: splitList(draft.colors),
        sizes: splitList(draft.sizes),
        occasions: splitList(draft.occasions),
        price_per_day: price,
        blurb: draft.blurb.trim(),
        notes: draft.notes.trim(),
        photos: draft.photos,
        status: draft.status,
      };
      setItems((prev) => {
        const rest = prev.filter((x) => x.slug !== slug);
        return [...rest, row].sort((a, b) => a.name.localeCompare(b.name));
      });
      setMode("list");
      setMsg({ ok: true, text: mode === "add" ? "Added to the catalogue." : "Saved." });
    });
  }

  function pauseToggle(i: CatalogueItem) {
    const next: ItemStatus = i.status === "available" ? "paused" : "available";
    start(async () => {
      const res = await setGownStatus(i.slug, next);
      if (!res.ok) {
        setMsg({ ok: false, text: res.ok ? "Could not update." : res.error });
        return;
      }
      setItems((prev) => prev.map((x) => (x.slug === i.slug ? { ...x, status: next } : x)));
    });
  }

  function remove(i: CatalogueItem) {
    if (!confirm(`Remove ${i.name}? Live bookings will block this.`)) return;
    start(async () => {
      const res = await removeGown(i.slug);
      if (!res.ok) {
        setMsg({ ok: false, text: res.ok ? "Could not remove." : res.error });
        return;
      }
      setItems((prev) => prev.filter((x) => x.slug !== i.slug));
      setMsg({ ok: true, text: "Removed." });
    });
  }

  if (mode !== "list") {
    return (
      <div className="sec card wrap cat" data-cat={mode}>
        <h1>{mode === "add" ? "Add an item" : "Edit item"}</h1>
        <p className="sub">Photos are compressed on your phone before upload. The public site hides a blank price.</p>
        {msg ? (
          <p className={msg.ok ? "note" : "alert"} role="status">
            {msg.text}
          </p>
        ) : null}
        <div className="fld">
          <label htmlFor="cn">Name</label>
          <input
            id="cn"
            className="inp"
            value={draft.name}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                name: e.target.value,
                slug: mode === "add" ? slugify(e.target.value) : d.slug,
              }))
            }
          />
        </div>
        <div className="fld">
          <label htmlFor="cs">Slug</label>
          <input
            id="cs"
            className="inp"
            value={draft.slug}
            disabled={mode === "edit"}
            onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value.toLowerCase() }))}
          />
        </div>
        <div className="fld">
          <label>Type</label>
          <div className="taps" role="radiogroup" aria-label="Item type">
            {ITEM_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`tap${draft.item_type === t.id ? " wine" : ""}`}
                aria-pressed={draft.item_type === t.id}
                onClick={() => setDraft((d) => ({ ...d, item_type: t.id }))}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="fld">
          <label htmlFor="cc">Colors</label>
          <input id="cc" className="inp" placeholder="red, gold" value={draft.colors} onChange={(e) => setDraft((d) => ({ ...d, colors: e.target.value }))} />
        </div>
        <div className="fld">
          <label htmlFor="cz">Sizes</label>
          <input id="cz" className="inp" placeholder="S, M, L" value={draft.sizes} onChange={(e) => setDraft((d) => ({ ...d, sizes: e.target.value }))} />
        </div>
        <div className="fld">
          <label htmlFor="co">Occasions</label>
          <input id="co" className="inp" placeholder="Debut, Pageant" value={draft.occasions} onChange={(e) => setDraft((d) => ({ ...d, occasions: e.target.value }))} />
        </div>
        <div className="fld">
          <label htmlFor="cp">Rental price per day (optional)</label>
          <input id="cp" className="inp" inputMode="numeric" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} />
        </div>
        <div className="fld">
          <label htmlFor="cb">Short blurb</label>
          <textarea id="cb" className="inp" rows={3} value={draft.blurb} onChange={(e) => setDraft((d) => ({ ...d, blurb: e.target.value }))} />
        </div>
        <div className="fld">
          <label htmlFor="cno">Notes (owners only)</label>
          <textarea id="cno" className="inp" rows={2} value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
        </div>
        <div className="fld">
          <label htmlFor="cph">Photos</label>
          <input id="cph" type="file" accept="image/*" capture="environment" multiple disabled={uploading || busy} onChange={(e) => onFiles(e.target.files)} />
          <div className="taps" style={{ marginTop: 10 }}>
            {draft.photos.map((ph, i) => (
              <div key={ph.path + i} className="ph" title={ph.alt}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph.path} alt={ph.alt} width={ph.w} height={ph.h} />
              </div>
            ))}
          </div>
          {draft.photos.length ? (
            <button type="button" className="tbtn" onClick={() => setDraft((d) => ({ ...d, photos: [] }))}>
              Clear photos
            </button>
          ) : null}
        </div>
        <div className="fld">
          <label>Status</label>
          <div className="taps">
            <button type="button" className={`tap${draft.status === "available" ? " wine" : ""}`} onClick={() => setDraft((d) => ({ ...d, status: "available" }))}>
              Available
            </button>
            <button type="button" className={`tap${draft.status === "paused" ? " wine" : ""}`} onClick={() => setDraft((d) => ({ ...d, status: "paused" }))}>
              Paused
            </button>
          </div>
        </div>
        <div className="acts">
          <button type="button" className="btn btn-wine" disabled={busy || uploading} onClick={save}>
            {busy ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn btn-plain" disabled={busy} onClick={() => setMode("list")}>
            Cancel
          </button>
        </div>
        <p className="sub" style={{ marginTop: 8 }}>
          Bucket: {CATALOGUE_BUCKET}. Max 5 MB per file on the free plan.
        </p>
      </div>
    );
  }

  return (
    <div className="sec card wrap cat" data-cat="list">
      <h1>Catalogue</h1>
      <p className="sub">
        {plural(items.length, "item", "items")}
        {items.length ? ` · ${counts.a} available · ${counts.p} paused` : ""}
      </p>
      <div className="acts">
        <button type="button" className="btn btn-wine" onClick={openAdd}>
          Add an item
        </button>
      </div>
      {msg ? (
        <p className={msg.ok ? "note" : "alert"} role="status" data-note={msg.ok ? "ok" : "err"}>
          {msg.text}
        </p>
      ) : null}
      {!items.length ? (
        <p className="sub">No items yet. Add a gown or accessory to show it on the public site.</p>
      ) : (
        <ul className="list">
          {items.map((i) => (
            <li key={i.slug} data-slug={i.slug} data-status={i.status}>
              <div className="row">
                <div className="ph">
                  {i.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.photos[0].path} alt={i.photos[0].alt} width={i.photos[0].w} height={i.photos[0].h} />
                  ) : null}
                </div>
                <div className="grow">
                  <div className="n">{i.name}</div>
                  <div className="g">
                    {itemTypeLabel(i.item_type)}
                    {i.price_per_day != null ? ` · ₱${i.price_per_day.toLocaleString("en-PH")}/day` : " · Price on request"}
                  </div>
                  <span className={`pill ${i.status === "available" ? "on" : "muted"}`}>
                    {i.status === "available" ? "Available" : "Paused"}
                  </span>
                  <div className="ac">
                    <button type="button" className="tbtn" disabled={busy} onClick={() => openEdit(i)}>
                      Edit
                    </button>
                    <button type="button" className="tbtn" disabled={busy} onClick={() => pauseToggle(i)}>
                      {i.status === "available" ? "Pause" : "Make available"}
                    </button>
                    <button type="button" className="tbtn red" disabled={busy} onClick={() => remove(i)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
