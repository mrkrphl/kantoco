import Image from "next/image";
import { ClipReveal } from "@/components/demos/ClipReveal";
import { FadeUp } from "@/components/demos/FadeUp";
import { HaligiShell } from "@/components/demos/haligi/HaligiShell";

export default function HaligiAbout() {
  return (
    <HaligiShell current="About">
      <div className="grid md:grid-cols-2">
        <div className="px-4 py-10 md:px-6 md:py-14">
          <FadeUp>
            <h1 className="haligi-cond text-5xl text-[var(--ha-yellow)] md:text-6xl">
              Haligi means post.
              <br />
              The lift is the post.
            </h1>
          </FadeUp>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--ha-steel)]">
            <p>
              This sample is a two-bay idea: roll-up, lift, drain pan, a board
              with hours. Named for a post, not a luxury badge. Not a parts
              house in another city.
            </p>
            <p>
              Copy stays short. If a job needs a part we do not keep, we say so
              before the car goes up. Photos are ramps, tires, oil, and tools.
            </p>
            <p>
              Sample lot on the Sucat / Dr. A. Santos service corridor,
              Parañaque. Fictional bay. Not a real address. Not a real phone.
            </p>
          </div>
        </div>
        <ClipReveal className="relative min-h-[280px]">
          <Image
            src="/demos/haligi-auto/oil-tools.jpg"
            alt="Wrenches and drivers stamped on a shop wall"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </ClipReveal>
      </div>
    </HaligiShell>
  );
}
