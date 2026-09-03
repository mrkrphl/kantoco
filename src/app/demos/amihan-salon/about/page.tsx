import Image from "next/image";
import { AmihanShell } from "@/components/demos/amihan/AmihanShell";

export default function AmihanAbout() {
  return (
    <AmihanShell current="About">
      <div className="amihan-page">
        <h1 className="amihan-display max-w-2xl text-4xl md:text-6xl">
          Named for the northeast wind, not a founder face.
        </h1>

        <div className="mt-16 grid gap-12 md:grid-cols-[1.15fr_0.85fr] md:items-start">
          <div className="space-y-5 text-base leading-relaxed text-[var(--mute)]">
            <p>
              Amihan is the northeast wind. This sample shop treats hair like
              weather: wet in the bowl, set under the light, then sent back out
              into the street.
            </p>
            <p>
              The photos are tools, capes, mirrors, and wet texture. There are
              no influencer headshots. The type stays close because the room is
              close.
            </p>
            <p>
              Sample walk-up near BF Homes and Moonwalk, Parañaque. The unit is
              fictional. This is not a real salon.
            </p>
          </div>
          <div className="amihan-still">
            <Image
              src="/demos/amihan-salon/mirror-chair.jpg"
              alt="Empty chair, brick, diamond plate, and a bare mirror"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        </div>
      </div>
    </AmihanShell>
  );
}
