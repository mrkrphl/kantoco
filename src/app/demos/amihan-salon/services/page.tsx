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
      <div className="amihan-page">
        <h1 className="amihan-display text-4xl md:text-6xl">The laminated board</h1>
        <p className="mt-4 max-w-md text-[var(--mute)]">
          Sample prices for this demo only. A live parlor would write their own
          numbers on the same kind of menu.
        </p>

        <ol className="amihan-menu">
          {menu.map(([name, note, price], i) => (
            <li key={name}>
              <div>
                <p className="amihan-display text-2xl md:text-3xl">
                  {i + 1}. {name}
                </p>
                <p className="mt-1 text-sm text-[var(--mute)]">{note}</p>
              </div>
              <p className="text-[var(--accent)]">{price}</p>
            </li>
          ))}
        </ol>

        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="amihan-cta"
        >
          Message us on Facebook
        </a>
      </div>
    </AmihanShell>
  );
}
