import { FadeUp } from "@/components/demos/FadeUp";
import { AmihanShell } from "@/components/demos/amihan/AmihanShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

const menu = [
  ["Monsoon cut", "Wet cut. Shape that lasts a humid week.", "₱550"],
  ["Clipper + scissor", "Sides tight. Top left to move.", "₱450"],
  ["Wash + set", "Bowl, cape, air dry or iron.", "₱350"],
  ["Color gloss", "Tone only. Bring a photo if you have one.", "from ₱1,200"],
  ["Keratin calm", "Frizz hold for rainy months.", "from ₱2,800"],
  ["Kids cut", "Sit still for 20 minutes. That is the deal.", "₱350"],
];

export default function AmihanServices() {
  return (
    <AmihanShell current="Services">
      <div className="px-4 pb-8 md:px-8">
        <FadeUp>
          <h1 className="amihan-display text-4xl md:text-6xl">The board</h1>
          <p className="mt-4 max-w-md text-sm text-[var(--ami-dim)]">
            A menu, not a grid of three equal cards. Sample prices for this
            demo only.
          </p>
        </FadeUp>

        <ol className="mt-12 divide-y divide-[var(--ami-teal)] border-y border-[var(--ami-teal)]">
          {menu.map(([name, note, price], i) => (
            <li
              key={name}
              className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-5"
            >
              <span className="amihan-display text-[var(--ami-tungsten)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="amihan-display text-2xl md:text-3xl">{name}</p>
                <p className="mt-1 text-sm text-[var(--ami-dim)]">{note}</p>
              </div>
              <p className="text-sm text-[var(--ami-tungsten)]">{price}</p>
            </li>
          ))}
        </ol>

        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-block text-sm text-[var(--ami-tungsten)] underline underline-offset-4"
        >
          Book a real shop site
        </a>
      </div>
    </AmihanShell>
  );
}
