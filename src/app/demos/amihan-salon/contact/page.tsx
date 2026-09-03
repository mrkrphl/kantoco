import { AmihanShell } from "@/components/demos/amihan/AmihanShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

export default function AmihanContact() {
  return (
    <AmihanShell current="Contact">
      <div className="amihan-page">
        <h1 className="amihan-display text-4xl md:text-6xl">
          Look for the rose sign, then message.
        </h1>

        <dl className="mt-14 max-w-lg space-y-10 text-base">
          <div>
            <dt className="uppercase tracking-[0.18em] text-[var(--accent)]">
              Hours
            </dt>
            <dd className="mt-2">
              Tuesday to Sunday, 10:00-20:00
              <br />
              Monday closed
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.18em] text-[var(--accent)]">
              Area
            </dt>
            <dd className="mt-2 leading-relaxed text-[var(--mute)]">
              Sample walk-up on a fictional strip near BF Homes and Moonwalk,
              Parañaque. Not a real unit. No real phone.
            </dd>
          </div>
        </dl>

        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="amihan-display amihan-cta text-2xl"
        >
          Message us on Facebook
        </a>
      </div>
    </AmihanShell>
  );
}
