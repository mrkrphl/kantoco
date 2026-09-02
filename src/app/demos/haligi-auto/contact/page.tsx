import { HaligiShell } from "@/components/demos/haligi/HaligiShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

export default function HaligiContact() {
  return (
    <HaligiShell current="Contact">
      <div className="px-4 py-10 md:px-6 md:py-16">
        <h1 className="haligi-cond text-5xl text-[var(--ha-ink)] md:text-7xl">
          Roll up, then message.
        </h1>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <section className="haligi-form p-5">
            <h2 className="haligi-cond text-2xl text-[var(--ha-carbon)]">Hours</h2>
            <p className="mt-3 text-sm">
              Monday to Saturday 8:00-18:00
              <br />
              Sunday 8:00-12:00
            </p>
          </section>
          <section className="haligi-form p-5">
            <h2 className="haligi-cond text-2xl text-[var(--ha-carbon)]">Area</h2>
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
          className="haligi-cond mt-8 inline-block bg-[var(--ha-oxide)] px-6 py-4 text-2xl text-[#f4efe3]"
        >
          Message us on Facebook
        </a>
      </div>
    </HaligiShell>
  );
}
