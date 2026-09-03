import Image from "next/image";
import { HaligiShell } from "@/components/demos/haligi/HaligiShell";

export default function HaligiAbout() {
  return (
    <HaligiShell current="About">
      <div className="grid md:grid-cols-[1.05fr_0.95fr]">
        <div className="haligi-intro">
          <h1 className="haligi-cond haligi-title">
            Haligi means post. The lift is the post.
          </h1>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-[var(--mute)]">
            <p>
              This sample is a two-bay idea: roll-up, lift, drain pan, and a
              board with hours. Named for a post, not a luxury badge. Not a
              parts house in another city.
            </p>
            <p>
              If a job needs a part we do not keep, we say so before the car
              goes up. Photos are ramps, tires, oil, and tools.
            </p>
            <p>
              Sample lot on the Sucat / Dr. A. Santos service corridor,
              Parañaque. Fictional bay. Not a real address. Not a real phone.
            </p>
          </div>
        </div>
        <div className="relative min-h-[280px]">
          <Image
            src="/demos/haligi-auto/oil-tools.jpg"
            alt="Wrenches and drivers stamped on a shop wall"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </HaligiShell>
  );
}
