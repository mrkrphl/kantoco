import { NaraShell } from "@/components/demos/nara/NaraShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

export default function NaraContact() {
  return (
    <NaraShell current="Contact">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--nara-green)]">
          Contact
        </p>
        <h1 className="nara-serif mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Message first. This sample has no fake hotline.
        </h1>

        <div className="mt-10 grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <section className="bg-[var(--nara-card)] p-6 ring-1 ring-[var(--nara-rule)]">
            <h2 className="nara-serif text-lg font-semibold">Hours</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Monday to Saturday</dt>
                <dd className="font-semibold">8:00-17:00</dd>
              </div>
              <div className="flex justify-between">
                <dt>Sunday</dt>
                <dd className="font-semibold">Closed</dd>
              </div>
            </dl>
          </section>
          <section className="bg-[var(--nara-card)] p-6 ring-1 ring-[var(--nara-rule)]">
            <h2 className="nara-serif text-lg font-semibold">Area</h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--nara-muted)]">
              Sample lot on a fictional block off Dr. A. Santos Avenue, near BF
              Homes, Parañaque. This is not a real street address and not a real
              clinic. The map pin is not live.
            </p>
          </section>
        </div>

        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex bg-[var(--nara-maroon)] px-5 py-3.5 text-sm font-semibold text-[#f7fbf8]"
        >
          Message us on Facebook
        </a>
      </div>
    </NaraShell>
  );
}
