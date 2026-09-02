import { AmihanShell } from "@/components/demos/amihan/AmihanShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

const menu = [
  ["Monsoon cut", "Wet cut with a shape that lasts a humid week.", "₱550"],
  ["Clipper and scissor", "Sides tight, top left to move.", "₱450"],
  ["Wash and set", "Bowl, cape, then air dry or iron.", "₱350"],
  ["Color gloss", "Tone only. Bring a photo if you have one.", "from ₱1,200"],
  ["Keratin calm", "Frizz hold for rainy months.", "from ₱2,800"],
  ["Kids cut", "Sit still for 20 minutes. That is the deal.", "₱350"],
];

export default function AmihanServices() {
  return (
    <AmihanShell current="Services">
      <div className="px-4 pb-8 md:px-8">
        <h1 className="amihan-display text-4xl md:text-6xl">The laminated board</h1>
        <p className="mt-4 max-w-md text-sm text-[var(--ami-dim)]">
          Sample prices for this demo only. A live parlor would write their own
          numbers on the same kind of menu.
        </p>

        <ol className="mt-10 bg-[var(--ami-paper)] px-4 py-2 shadow-[0_12px_28px_rgba(58,36,32,0.08)]">
          {menu.map(([name, note, price], i) => (
            <li
              key={name}
              className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-dashed border-[color-mix(in_srgb,var(--ami-rose)_40%,transparent)] py-4 last:border-b-0"
            >
              <div>
                <p className="amihan-display text-2xl md:text-3xl">
                  {i + 1}. {name}
                </p>
                <p className="mt-1 text-sm text-[var(--ami-dim)]">{note}</p>
              </div>
              <p className="text-sm text-[var(--ami-rose)]">{price}</p>
            </li>
          ))}
        </ol>

        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-block text-sm text-[var(--ami-rose)] underline underline-offset-4"
        >
          Message us on Facebook
        </a>
      </div>
    </AmihanShell>
  );
}
