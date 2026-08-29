import Image from "next/image";
import Link from "next/link";
import { ClipReveal } from "@/components/demos/ClipReveal";
import { FadeUp } from "@/components/demos/FadeUp";
import { NaraShell } from "@/components/demos/nara/NaraShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

export default function NaraHome() {
  return (
    <NaraShell current="Home">
      <div className="mx-auto max-w-5xl px-4 pb-8 pt-8 md:px-6 md:pt-12">
        <FadeUp>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--nara-green)]">
            Walk-in neighborhood clinic
          </p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            A chair ready. Hours posted. No mystery lobby.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--nara-muted)]">
            Consults for the Santos-side blocks. We treat coughs, cuts, and the
            weekday check that cannot wait for a hospital queue.
          </p>
        </FadeUp>
      </div>

      <ClipReveal className="overflow-hidden">
        <div className="relative h-[52vw] min-h-[240px] max-h-[520px] w-full">
          <Image
            src="/demos/nara-clinic/hallway-daylight.jpg"
            alt="Empty clinic beds in daylight, made and waiting"
            fill
            className="object-cover"
            sizes="100vw"
            preload
          />
        </div>
      </ClipReveal>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_0.8fr] md:px-6">
        <FadeUp delay={0.08}>
          <p className="text-sm font-semibold text-[var(--nara-green)]">
            What we take
          </p>
          <ul className="mt-4">
            {[
              ["General consult", "Fever, cough, gut, skin, follow-up."],
              ["Wound & dressing", "Cuts from the shop or the kitchen."],
              ["BP & sugar check", "Same-day reading. Written on paper."],
              ["Clearance papers", "Work and school forms, if the chart fits."],
            ].map(([title, body]) => (
              <li key={title} className="nara-ledger py-4">
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-[var(--nara-muted)]">{body}</p>
              </li>
            ))}
          </ul>
          <Link
            href="/demos/nara-clinic/services"
            className="mt-6 inline-block text-sm font-semibold text-[var(--nara-rust)] underline underline-offset-4"
          >
            Full service list
          </Link>
        </FadeUp>

        <aside className="border border-[var(--nara-rule)] bg-[color-mix(in_srgb,var(--nara-green)_8%,var(--nara-paper))] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nara-green)]">
            Hours
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt>Mon to Sat</dt>
              <dd className="font-semibold">8:00-17:00</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Sunday</dt>
              <dd className="font-semibold">Closed</dd>
            </div>
          </dl>
          <p className="mt-5 text-sm leading-relaxed text-[var(--nara-muted)]">
            Sample block off Dr. A. Santos Ave., BF Homes fringe, Parañaque.
            Fictional address. Not a real clinic.
          </p>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex bg-[var(--nara-rust)] px-4 py-3 text-sm font-semibold text-[var(--nara-paper)]"
          >
            Message on Messenger
          </a>
        </aside>
      </div>
    </NaraShell>
  );
}
