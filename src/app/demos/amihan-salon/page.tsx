import Image from "next/image";
import Link from "next/link";
import { AmihanShell } from "@/components/demos/amihan/AmihanShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

export default function AmihanHome() {
  return (
    <AmihanShell current="Home">
      <section className="px-4 md:px-8">
        <h1 className="amihan-display max-w-2xl text-4xl leading-[1.05] md:text-6xl">
          Hair that still holds after a humid afternoon on the Moonwalk road.
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--ami-dim)] md:text-base">
          Amihan is a sample parlor: wet cut in the bowl, set under the
          fluorescent, then back out into the street. Tuesday to Sunday,
          10:00-20:00. Monday is closed.
        </p>

        <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-end">
          <div className="amihan-sheen relative aspect-[3/4] w-full overflow-hidden md:w-[58%]">
            <Image
              src="/demos/amihan-salon/mirrors.jpg"
              alt="Empty wash station, brick, and a long salon mirror"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 58vw"
              preload
            />
          </div>
          <div className="relative aspect-[4/5] w-[72%] overflow-hidden md:mb-10 md:-ml-10 md:w-[38%]">
            <Image
              src="/demos/amihan-salon/wet-cut.jpg"
              alt="Dark wet hair in a shears-and-comb cut, no face in frame"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 72vw, 38vw"
            />
          </div>
        </div>
      </section>

      <section className="mt-14 flex flex-col gap-6 px-4 pb-4 md:flex-row md:items-end md:justify-between md:px-8">
        <p className="max-w-xs text-sm text-[var(--ami-dim)]">
          Sample walk-up near BF Homes and Moonwalk, Parañaque. The unit number
          is fictional.
        </p>
        <div className="flex flex-col gap-3 text-sm">
          <Link
            href="/demos/amihan-salon/gallery"
            className="underline decoration-[var(--ami-rose)] underline-offset-4"
          >
            Open the gallery
          </Link>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--ami-rose)]"
          >
            Message us on Facebook
          </a>
        </div>
      </section>
    </AmihanShell>
  );
}
