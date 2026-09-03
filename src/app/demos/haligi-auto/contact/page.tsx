import { HaligiShell } from "@/components/demos/haligi/HaligiShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

export default function HaligiContact() {
  return (
    <HaligiShell current="Contact">
      <div className="haligi-page pb-16">
        <h1 className="haligi-cond haligi-title">Roll up, then message.</h1>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <section className="haligi-form p-6">
            <h2 className="haligi-cond text-2xl">Hours</h2>
            <p className="mt-3 text-sm">
              Monday to Saturday 8:00-18:00
              <br />
              Sunday 8:00-12:00
            </p>
          </section>
          <section className="haligi-form p-6">
            <h2 className="haligi-cond text-2xl">Area</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--mute)]">
              Sample bay on the Sucat / Dr. A. Santos service corridor,
              Parañaque. Fictional lot. Not a real shop address. No real phone.
            </p>
          </section>
        </div>

        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="haligi-cta"
        >
          Message us on Facebook
        </a>
      </div>
    </HaligiShell>
  );
}
