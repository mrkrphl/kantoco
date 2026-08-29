import Image from "next/image";
import Link from "next/link";
import { ClipReveal } from "@/components/demos/ClipReveal";
import { FadeUp } from "@/components/demos/FadeUp";
import { HaligiPin } from "@/components/demos/haligi/HaligiPin";
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
      <HaligiPin>
        <div className="bg-[var(--ha-yellow)] px-4 py-3 text-[var(--ha-black)] md:px-6">
          <p className="haligi-cond text-xl md:text-2xl">
            Mon-Sat 8:00-18:00 · Sun 8:00-12:00 · Sample bay, Sucat corridor
          </p>
        </div>
      </HaligiPin>

      <div className="grid md:grid-cols-[1.05fr_0.95fr] md:items-start">
        <div className="px-4 py-6 md:px-6 md:py-7">
          <FadeUp>
            <h1 className="haligi-cond text-5xl leading-[0.9] text-[var(--ha-yellow)] md:text-7xl">
              We take the car.
              <br />
              You get it back running.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--ha-steel)] md:text-base">
              Straight talk for a neighborhood bay. No lounge. No wait-and-see
              quote. This is a labeled sample, not a live shop.
            </p>
          </FadeUp>
          <ol className="mt-8">
            {jobs.map(([n, title, body]) => (
              <li
                key={n}
                className="grid grid-cols-[2.5rem_1fr] gap-3 border-t border-white/15 py-3"
              >
                <span className="haligi-cond text-xl text-[var(--ha-yellow)]">
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
              className="haligi-cond bg-[var(--ha-yellow)] px-5 py-3 text-xl text-[var(--ha-black)]"
            >
              Message on Messenger
            </a>
            <Link
              href="/demos/haligi-auto/services"
              className="haligi-cond border-2 border-[var(--ha-yellow)] px-5 py-3 text-xl text-[var(--ha-yellow)]"
            >
              Work order
            </Link>
          </div>
        </div>

        <ClipReveal className="relative min-h-[280px] md:h-[calc(100svh-12.5rem)] md:min-h-[22rem] md:max-h-[calc(100svh-12.5rem)]">
          <Image
            src="/demos/haligi-auto/lift.jpg"
            alt="White wagon on a two-post lift in a working bay"
            fill
            className="object-cover object-[center_72%]"
            sizes="(max-width: 768px) 100vw, 50vw"
            preload
          />
        </ClipReveal>
      </div>
    </HaligiShell>
  );
}
