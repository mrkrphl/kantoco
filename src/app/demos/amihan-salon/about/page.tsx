import Image from "next/image";
import { ClipReveal } from "@/components/demos/ClipReveal";
import { FadeUp } from "@/components/demos/FadeUp";
import { AmihanShell } from "@/components/demos/amihan/AmihanShell";

export default function AmihanAbout() {
  return (
    <AmihanShell current="About">
      <div className="px-4 pb-8 md:px-8">
        <FadeUp>
          <h1 className="amihan-display max-w-2xl text-4xl md:text-6xl">
            Named for the wind, not a founder face.
          </h1>
        </FadeUp>

        <div className="mt-12 grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 text-sm leading-relaxed text-[var(--ami-dim)] md:text-base">
            <p>
              Amihan is the northeast wind. This sample shop treats hair like
              weather: wet in the bowl, set under tungsten, sent back out into
              the street.
            </p>
            <p>
              The photos are tools, capes, mirrors, and wet texture. No
              influencer headshots. No Playfair menu card. The type is tight
              because the room is tight.
            </p>
            <p>
              Sample walk-up near the BF / Moonwalk edge, Parañaque. Fictional
              unit. Not a real salon. Built so a corner shop can see a five-pager
              that is not a cafe leftover.
            </p>
          </div>
          <ClipReveal direction="left">
            <div className="relative aspect-[4/5]">
              <Image
                src="/demos/amihan-salon/mirror-chair.jpg"
                alt="Empty chair, brick, diamond plate, and a bare mirror"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </ClipReveal>
        </div>
      </div>
    </AmihanShell>
  );
}
