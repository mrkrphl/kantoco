"use client";

import { useEffect, useState } from "react";
import { listCatalogue, type CatalogueItem } from "@/lib/cgr-catalogue";

export type ChosenAddon = { slug: string; name: string; price_per_day: number | null };

/** r9.1: pick available accessories as add-ons. Prices only when the owner set one. */
export function AddonPicker({
  value,
  onChange,
  compact = false,
}: {
  value: ChosenAddon[];
  onChange: (next: ChosenAddon[]) => void;
  compact?: boolean;
}) {
  const [items, setItems] = useState<CatalogueItem[] | null>(null);
  useEffect(() => {
    let live = true;
    listCatalogue().then((all) => {
      if (!live) return;
      setItems(all.filter((i) => i.item_type === "accessory"));
    });
    return () => {
      live = false;
    };
  }, []);
  if (items === null) return <p className={compact ? "r11-note" : "sub"}>Loading accessories…</p>;
  if (!items.length) return null;
  const selected = new Set(value.map((v) => v.slug));
  return (
    <fieldset className="addon-pick" data-addons="picker">
      <legend>Add accessories (optional)</legend>
      <ul>
        {items.map((i) => {
          const on = selected.has(i.slug);
          return (
            <li key={i.slug}>
              <label>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => {
                    if (on) onChange(value.filter((v) => v.slug !== i.slug));
                    else
                      onChange([
                        ...value,
                        { slug: i.slug, name: i.name, price_per_day: i.price_per_day },
                      ]);
                  }}
                />
                <span className="an">{i.name}</span>
                <span className="ap">
                  {i.price_per_day != null ? `₱${i.price_per_day.toLocaleString("en-PH")}/day` : "Ask the shop"}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

export { addonPlain } from "@/lib/cgr-catalogue";
