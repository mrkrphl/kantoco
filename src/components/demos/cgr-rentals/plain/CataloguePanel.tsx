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
import { plural } from "@/lib/cgr-owner-format";
import {
  removeGown,
  setGownStatus,
  upsertGown,
  uploadCataloguePhoto,
} from "@/app/demos/cgr-rentals/owner/catalogue/actions";

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

/** Unique slug: base from name, then -2, -3… against existing slugs. */
function uniqueSlug(name: string, taken: Set<string>, keep?: string): string {
  const base = slugify(name);
  if (keep && keep === base) return keep;
  if (!taken.has(base) || keep === base) return base;
  for (let n = 2; n < 100; n++) {
    const s = `${base}-${n}`.slice(0, 60);
    if (!taken.has(s) || s === keep) return s;
  }
  return `${base}-${Date.now().toString(36).slice(-4)}`.slice(0, 60);
}

export function CataloguePanel({
  items: initial,
  startAdd = false,
  startEditSlug,
  startRemoveSlug,
}: {
  items: CatalogueItem[];
  /** Local harness stills only. */
  startAdd?: boolean;
  startEditSlug?: string;
  startRemoveSlug?: string;
}) {
  const [items, setItems] = useState(initial);
  const seedEdit = startEditSlug ? initial.find((i) => i.slug === startEditSlug) : undefined;
  const [mode, setMode] = useState<"list" | "add" | "edit">(
    startAdd ? "add" : seedEdit ? "edit" : "list",
  );
  const [draft, setDraft] = useState<Draft>(seedEdit ? fromItem(seedEdit) : empty());
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState<CatalogueItem | null>(
    startRemoveSlug ? initial.find((i) => i.slug === startRemoveSlug) ?? null : null,
  );

  const taken = useMemo(() => new Set(items.map((i) => i.slug)), [items]);
  const counts = useMemo(() => {
    const a = items.filter((i) => i.status === "available").length;
    return { a, p: items.length - a };
  }, [items]);

  function openAdd() {
    setDraft(empty());
    setMode("add");
    setMsg(null);
    setRemoving(null);
  }
  function openEdit(i: CatalogueItem) {
    setDraft(fromItem(i));
    setMode("edit");
    setMsg(null);
    setRemoving(null);
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setMsg(null);
    try {
      const next = [...draft.photos];
      const slug =
        mode === "edit"
          ? draft.slug
          : uniqueSlug(draft.name || "item", taken, draft.slug || undefined);
      for (const file of Array.from(files).slice(0, 6)) {
        const { blob, w, h } = await compressPhoto(file);
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
      setDraft((d) => ({ ...d, photos: next, slug: d.slug || slug }));
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
    const slug =
      mode === "edit" ? draft.slug : uniqueSlug(name, taken, draft.slug || undefined);
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

  function confirmRemove() {
    if (!removing) return;
    const i = removing;
    start(async () => {
      const res = await removeGown(i.slug);
      if (!res.ok) {
        setMsg({ ok: false, text: res.ok ? "Could not remove." : res.error });
        setRemoving(null);
        return;
      }
      setItems((prev) => prev.filter((x) => x.slug !== i.slug));
      setRemoving(null);
      setMsg({ ok: true, text: "Removed." });
    });
  }

  if (mode !== "list") {
    return (
      <div className="sec card wrap cat" data-cat={mode}>
        <h1>{mode === "add" ? "Add an item" : "Edit item"}</h1>
        <p className="sub">Photos are compressed on your phone before upload. A blank price stays hidden on the public site.</p>
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
            placeholder="e.g. Wine sequin slit gown"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
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
          <input id="cc" className="inp" placeholder="e.g. red, gold" value={draft.colors} onChange={(e) => setDraft((d) => ({ ...d, colors: e.target.value }))} />
        </div>
        <div className="fld">
          <label htmlFor="cz">Sizes</label>
          <input id="cz" className="inp" placeholder="e.g. S, M, L" value={draft.sizes} onChange={(e) => setDraft((d) => ({ ...d, sizes: e.target.value }))} />
        </div>
        <div className="fld">
          <label htmlFor="co">Occasions</label>
          <input id="co" className="inp" placeholder="e.g. Debut, Pageant" value={draft.occasions} onChange={(e) => setDraft((d) => ({ ...d, occasions: e.target.value }))} />
        </div>
        <div className="fld">
          <label htmlFor="cp">Rental price per day (optional)</label>
          <input id="cp" className="inp" inputMode="numeric" placeholder="Leave blank to hide on the site" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} />
        </div>
        <div className="fld">
          <label htmlFor="cb">Short blurb</label>
          <textarea id="cb" className="inp" rows={4} placeholder="A short line guests will read on the gown page" value={draft.blurb} onChange={(e) => setDraft((d) => ({ ...d, blurb: e.target.value }))} />
        </div>
        <div className="fld">
          <label htmlFor="cno">Notes (owners only)</label>
          <textarea id="cno" className="inp" rows={3} placeholder="Private notes — not shown on the public site" value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
        </div>
        <div className="fld">
          <span id="cph-lab">Photos</span>
          <label className="filebtn" htmlFor="cph">
            {uploading ? "Uploading…" : "Add photos"}
            <input id="cph" type="file" accept="image/*" capture="environment" multiple disabled={uploading || busy} onChange={(e) => onFiles(e.target.files)} aria-labelledby="cph-lab" />
          </label>
          <p className="hint">Up to 5 MB per photo. Shown uncropped.</p>
          <div className="thumbs">
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
      <div className="acts acts-top">
        <button type="button" className="btn btn-wine" onClick={openAdd}>
          Add an item
        </button>
      </div>
      {msg ? (
        <p className={msg.ok ? "note" : "alert"} role="status" data-note={msg.ok ? "ok" : "err"}>
          {msg.text}
        </p>
      ) : null}
      {removing ? (
        <div className="confirm" role="alertdialog" aria-labelledby="rm-h" data-remove="confirm">
          <h2 id="rm-h" style={{ fontSize: 18, margin: 0 }}>
            Remove {removing.name}?
          </h2>
          <p className="sub" style={{ marginTop: 8 }}>
            Live bookings will block this. Paused items can be removed if nothing is holding them.
          </p>
          <div className="acts">
            <button type="button" className="btn btn-wine" disabled={busy} onClick={confirmRemove}>
              {busy ? "Removing…" : "Remove"}
            </button>
            <button type="button" className="btn btn-plain" disabled={busy} onClick={() => setRemoving(null)}>
              Keep
            </button>
          </div>
        </div>
      ) : null}
      {!items.length ? (
        <p className="sub">No items yet. Add a gown or accessory to show it on the public site.</p>
      ) : (
        <ul className="list">
          {items.map((i) => (
            <li key={i.slug} data-slug={i.slug} data-status={i.status}>
              <div className="row">
                {i.photos[0] ? (
                  <div className="ph">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.photos[0].path} alt={i.photos[0].alt} width={i.photos[0].w} height={i.photos[0].h} />
                  </div>
                ) : null}
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
                    <button type="button" className="tbtn red" disabled={busy} onClick={() => setRemoving(i)}>
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
