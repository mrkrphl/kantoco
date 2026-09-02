import Image from "next/image";
import Link from "next/link";
import { NaraShell } from "@/components/demos/nara/NaraShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

export default function NaraHome() {
  return (
    <NaraShell current="Home">
      <div className="mx-auto grid max-w-5xl items-start gap-0 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="px-4 py-10 md:px-6 md:py-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--nara-green)]">
            Neighborhood clinic
          </p>
          <h1 className="nara-serif mt-3 max-w-md text-4xl font-semibold leading-[1.12] tracking-tight md:text-5xl">
            Hours on the door, a chair in the consult room, and a list of what we
            actually take.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--nara-muted)]">
            Nara is a sample clinic for the Santos-side blocks of BF Homes. We
            treat coughs, cuts, and the weekday check that should not wait for a
            hospital queue.
          </p>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex bg-[var(--nara-maroon)] px-4 py-3 text-sm font-semibold text-[#f7fbf8]"
          >
            Message us on Facebook
          </a>
        </div>
        <div className="relative min-h-[260px] md:min-h-[28rem]">
          <Image
            src="/demos/nara-clinic/hallway-daylight.jpg"
            alt="Empty clinic beds in daylight, made and waiting"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 55vw"
            preload
          />
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-[1.15fr_0.85fr] md:px-6">
        <div>
          <p className="text-sm font-semibold text-[var(--nara-green)]">
            What we take
          </p>
          <ul className="mt-4 divide-y divide-[var(--nara-rule)] border-y border-[var(--nara-rule)]">
            {[
              ["General consult", "Fever, cough, gut, skin, and follow-up."],
              ["Wound and dressing", "Cuts from the shop or the kitchen."],
              ["BP and sugar check", "Same-day reading written on paper."],
              ["Clearance papers", "Work and school forms, if the chart fits."],
            ].map(([title, body]) => (
              <li key={title} className="py-4">
                <p className="nara-serif font-semibold">{title}</p>
                <p className="mt-1 text-sm text-[var(--nara-muted)]">{body}</p>
              </li>
            ))}
          </ul>
          <Link
            href="/demos/nara-clinic/services"
            className="mt-6 inline-block text-sm font-semibold text-[var(--nara-maroon)] underline underline-offset-4"
          >
            Full service list
          </Link>
        </div>

        <aside className="nara-hours border border-[var(--nara-green)] bg-[var(--nara-card)] p-5 shadow-[4px_6px_0_rgba(31,90,70,0.12)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--nara-green)]">
            Hours
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt>Monday to Saturday</dt>
              <dd className="font-semibold">8:00-17:00</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Sunday</dt>
              <dd className="font-semibold">Closed</dd>
            </div>
          </dl>
          <p className="mt-5 text-sm leading-relaxed text-[var(--nara-muted)]">
            Sample block off Dr. A. Santos Avenue, BF Homes, Parañaque. This is
            a fictional address, not a real clinic.
          </p>
        </aside>
      </div>
    </NaraShell>
  );
}
