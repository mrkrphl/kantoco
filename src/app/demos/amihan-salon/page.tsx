import Image from "next/image";
import Link from "next/link";
import { ClipReveal } from "@/components/demos/ClipReveal";
import { FadeUp } from "@/components/demos/FadeUp";
import { AmihanShell } from "@/components/demos/amihan/AmihanShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

export default function AmihanHome() {
  return (
    <AmihanShell current="Home">
      <section className="relative px-4 md:px-8">
        <FadeUp>
          <h1 className="amihan-display max-w-3xl text-4xl leading-[0.92] md:text-7xl">
            Hair that holds through a southwest blow.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-[var(--ami-dim)]">
            Wet cut. Tungsten light. Cape on. We work the monsoon season like
            it is the point, not a problem.
          </p>
        </FadeUp>

        <div className="relative mt-10 grid min-h-[28rem] grid-cols-12 gap-3 md:min-h-[36rem]">
          <ClipReveal className="relative col-span-12 aspect-[4/5] md:col-span-7 md:aspect-auto md:h-[36rem]">
            <Image
              src="/demos/amihan-salon/mirrors.jpg"
              alt="Empty wash station, brick, and a long salon mirror"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              preload
            />
          </ClipReveal>
          <div className="relative col-span-7 aspect-[3/4] md:col-span-5 md:mt-16 md:aspect-auto md:h-[22rem]">
            <Image
              src="/demos/amihan-salon/tools.jpg"
              alt="Wet-styled hair texture, no face in frame"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 60vw, 40vw"
            />
          </div>
          <div className="relative col-span-5 aspect-square self-end md:absolute md:bottom-6 md:right-[18%] md:h-48 md:w-48">
            <Image
              src="/demos/amihan-salon/shears.jpg"
              alt="Shears hung on a dark wood rack"
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>
        </div>
      </section>

      <section className="mt-16 flex flex-col gap-8 px-4 md:flex-row md:items-end md:justify-between md:px-8">
        <p className="amihan-display text-2xl text-[var(--ami-tungsten)] md:text-4xl">
          OPEN
        </p>
        <p className="max-w-xs text-sm text-[var(--ami-dim)]">
          Tue-Sun 10:00-20:00. Monday closed. Sample walk-up near the BF /
          Moonwalk edge, Parañaque.
        </p>
        <div className="flex flex-col gap-3 text-sm">
          <Link
            href="/demos/amihan-salon/gallery"
            className="underline decoration-[var(--ami-tungsten)] underline-offset-4"
          >
            Open the gallery
          </Link>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--ami-tungsten)]"
          >
            Message on Messenger
          </a>
        </div>
      </section>
    </AmihanShell>
  );
}
