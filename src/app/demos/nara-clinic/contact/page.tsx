import { FadeUp } from "@/components/demos/FadeUp";
import { NaraShell } from "@/components/demos/nara/NaraShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

export default function NaraContact() {
  return (
    <NaraShell current="Contact">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <FadeUp>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--nara-green)]">
            Contact
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Message first. No fake hotline.
          </h1>
        </FadeUp>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <section className="border border-[var(--nara-rule)] p-6">
            <h2 className="text-lg font-semibold">Hours</h2>
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
          <section className="border border-[var(--nara-rule)] p-6">
            <h2 className="text-lg font-semibold">Area</h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--nara-muted)]">
              Sample lot on a fictional block off Dr. A. Santos Ave., near the
              BF Homes fringe, Parañaque. This is not a real street address
              and not a real clinic. Map pin is not live.
            </p>
          </section>
        </div>

        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex bg-[var(--nara-rust)] px-5 py-3.5 text-sm font-semibold text-[var(--nara-paper)]"
        >
          Message on Messenger
        </a>
      </div>
    </NaraShell>
  );
}
