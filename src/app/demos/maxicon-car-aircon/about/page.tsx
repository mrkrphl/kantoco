import Image from "next/image";
import { MaxiconShell } from "@/components/demos/maxicon/MaxiconShell";
import { maxicon } from "@/lib/maxicon";

export default function MaxiconAbout() {
  return (
    <MaxiconShell current="About">
      <div className="maxicon-page">
        <h1 className="maxicon-display maxicon-title">
          A specialist bay, not a general shop with an aircon hose.
        </h1>

        <div className="maxicon-split mt-12">
          <div className="maxicon-shot">
            <Image
              src="/demos/maxicon-car-aircon/maxicon-bay.jpg"
              alt="A technician in a Maxicon shirt working under the open hood of a Toyota."
              fill
              className="object-cover"
              sizes="(max-width: 880px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-5 text-base leading-relaxed text-[var(--mute)]">
            <p>
              {maxicon.name} sits at {maxicon.address}. On paper they also use{" "}
              {maxicon.alsoKnownAs}. The work is car aircon: sell the part, or
              open the system and fix it.
            </p>
            <p>
              Their public Facebook page has {maxicon.facebookFollowers}. This
              sample is a KantoCo pitch of how that shop could read on the web.
              They did not hire us. Do not treat this as their live site.
            </p>
            <p>
              {maxicon.cards} Hours come from their Facebook intro:{" "}
              {maxicon.hours}.
            </p>
          </div>
        </div>

        <div className="maxicon-split mt-16">
          <div className="space-y-5 text-base leading-relaxed text-[var(--mute)]">
            <p>
              The compressor photograph on this sample is one they published: a
              Panasonic unit for a Mazda 3, sitting on Toyota genuine-parts
              board. That is the kind of shelf they keep.
            </p>
            <p>{maxicon.recentPost}</p>
          </div>
          <div className="maxicon-shot">
            <Image
              src="/demos/maxicon-car-aircon/compressor.jpg"
              alt="A car aircon compressor on a parts board, photographed by the shop."
              fill
              className="object-cover"
              sizes="(max-width: 880px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </MaxiconShell>
  );
}
