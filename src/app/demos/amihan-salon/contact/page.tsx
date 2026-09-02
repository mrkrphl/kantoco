import { AmihanShell } from "@/components/demos/amihan/AmihanShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

export default function AmihanContact() {
  return (
    <AmihanShell current="Contact">
      <div className="px-4 pb-16 md:px-8">
        <h1 className="amihan-display text-4xl md:text-6xl">
          Look for the rose sign, then message.
        </h1>

        <dl className="mt-12 max-w-lg space-y-8 text-sm">
          <div>
            <dt className="uppercase tracking-[0.18em] text-[var(--ami-rose)]">
              Hours
            </dt>
            <dd className="mt-2">
              Tuesday to Sunday, 10:00-20:00
              <br />
              Monday closed
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.18em] text-[var(--ami-rose)]">
              Area
            </dt>
            <dd className="mt-2 leading-relaxed text-[var(--ami-dim)]">
              Sample walk-up on a fictional strip near BF Homes and Moonwalk,
              Parañaque. Not a real unit. No real phone.
            </dd>
          </div>
        </dl>

        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="amihan-display mt-12 inline-block bg-[var(--ami-rose)] px-6 py-4 text-2xl text-[#fff6ee]"
        >
          Message us on Facebook
        </a>
      </div>
    </AmihanShell>
  );
}
