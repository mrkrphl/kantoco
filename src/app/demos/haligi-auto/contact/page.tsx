import { FadeUp } from "@/components/demos/FadeUp";
import { HaligiShell } from "@/components/demos/haligi/HaligiShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

export default function HaligiContact() {
  return (
    <HaligiShell current="Contact">
      <div className="px-4 py-10 md:px-6 md:py-16">
        <FadeUp>
          <h1 className="haligi-cond text-5xl text-[var(--ha-yellow)] md:text-7xl">
            Roll up.
            <br />
            Then message.
          </h1>
        </FadeUp>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <section className="haligi-stamp bg-[var(--ha-black)] p-5">
            <h2 className="haligi-cond text-2xl text-[var(--ha-yellow)]">Hours</h2>
            <p className="mt-3 text-sm">
              Mon-Sat 8:00-18:00
              <br />
              Sunday 8:00-12:00
            </p>
          </section>
          <section className="haligi-stamp bg-[var(--ha-black)] p-5">
            <h2 className="haligi-cond text-2xl text-[var(--ha-yellow)]">Area</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ha-steel)]">
              Sample bay on the Sucat / Dr. A. Santos service corridor,
              Parañaque. Fictional lot. Not a real shop address. No real phone.
            </p>
          </section>
        </div>

        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="haligi-cond mt-8 inline-block bg-[var(--ha-yellow)] px-6 py-4 text-2xl text-[var(--ha-black)]"
        >
          Message on Messenger
        </a>
      </div>
    </HaligiShell>
  );
}
