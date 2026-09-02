import Image from "next/image";
import Link from "next/link";
import { HaligiShell } from "@/components/demos/haligi/HaligiShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

const jobs = [
  ["01", "PMS / oil", "Drain, filter, fill. You keep the old filter if you want it."],
  ["02", "Brakes", "Pads, fluid, rotor true. We say stop or go."],
  ["03", "Tires / align", "Mount, balance, pull to one side."],
  ["04", "A/C charge", "Leak check first. No magic cold."],
  ["05", "Undercarriage", "Lift work. We show you the rust before we quote."],
];

export default function HaligiHome() {
  return (
    <HaligiShell current="Home">
      <div className="haligi-photo-strip relative h-[38vw] min-h-[180px] max-h-[280px] w-full">
        <Image
          src="/demos/haligi-auto/lift.jpg"
          alt="White wagon on a two-post lift in a working bay"
          fill
          className="object-cover object-[center_72%]"
          sizes="100vw"
          preload
        />
      </div>

      <div className="px-4 py-8 md:px-6 md:py-10">
        <p className="text-sm text-[var(--ha-carbon)]">
          Monday to Saturday 8:00-18:00. Sunday 8:00-12:00. Sample bay, Sucat
          corridor.
        </p>
        <h1 className="haligi-cond mt-3 max-w-xl text-5xl leading-[0.92] text-[var(--ha-ink)] md:text-7xl">
          We take the car. You get it back running.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--ha-steel)] md:text-base">
          Straight talk for a neighborhood bay. There is no lounge and no
          wait-and-see quote. This is a sample, not a live shop.
        </p>

        <ol className="haligi-form mt-8 max-w-2xl p-4 md:p-5">
          {jobs.map(([n, title, body]) => (
            <li
              key={n}
              className="grid grid-cols-[2.4rem_1fr] gap-3 border-b border-dashed border-[#c9c0aa] py-3 last:border-b-0"
            >
              <span className="haligi-cond text-2xl text-[var(--ha-oxide)]">
                {n}
              </span>
              <div>
                <p className="haligi-cond text-2xl">{title}</p>
                <p className="text-sm text-[var(--ha-steel)]">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="haligi-cond bg-[var(--ha-oxide)] px-5 py-3 text-2xl text-[#f4efe3]"
          >
            Message us on Facebook
          </a>
          <Link
            href="/demos/haligi-auto/services"
            className="haligi-cond border-2 border-[var(--ha-carbon)] px-5 py-3 text-2xl text-[var(--ha-carbon)]"
          >
            Work order
          </Link>
        </div>
      </div>
    </HaligiShell>
  );
}
