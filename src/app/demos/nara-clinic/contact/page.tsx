import { NaraShell } from "@/components/demos/nara/NaraShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

export default function NaraContact() {
  return (
    <NaraShell current="Contact">
      <div className="nara-page pb-16">
        <p className="nara-kicker">Contact</p>
        <h1 className="nara-serif nara-title">
          Message first. This sample has no fake hotline.
        </h1>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <section className="nara-hours">
            <h2 className="nara-serif text-lg font-semibold">Hours</h2>
            <dl>
              <div>
                <dt>Monday to Saturday</dt>
                <dd className="font-semibold">8:00-17:00</dd>
              </div>
              <div>
                <dt>Sunday</dt>
                <dd className="font-semibold">Closed</dd>
              </div>
            </dl>
          </section>
          <section className="nara-hours">
            <h2 className="nara-serif text-lg font-semibold">Area</h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--mute)]">
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
          className="nara-cta"
        >
          Message us on Facebook
        </a>
      </div>
    </NaraShell>
  );
}
