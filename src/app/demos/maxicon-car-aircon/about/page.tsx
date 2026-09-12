import Image from "next/image";
import { MaxiconShell } from "@/components/demos/maxicon/MaxiconShell";
import { maxicon } from "@/lib/maxicon";

export default function MaxiconAbout() {
  return (
    <MaxiconShell>
      <div className="maxicon-page">
        <p className="maxicon-line">
          {maxicon.name} sits at {maxicon.address}.
        </p>
        <p className="maxicon-lede">
          On paper they also use {maxicon.alsoKnownAs}. The work is car aircon:
          sell the part, or open the system and fix it. Their public Facebook
          page has {maxicon.facebookFollowers}. {maxicon.cards} Hours come from
          their Facebook intro: {maxicon.hours}.
        </p>
      </div>
      <div className="maxicon-page-still">
        <Image
          src="/demos/maxicon-car-aircon/maxicon-bay.jpg"
          alt="A technician in a Maxicon shirt working under the open hood of a Toyota."
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <p className="maxicon-note maxicon-foot">{maxicon.sampleNote}</p>
    </MaxiconShell>
  );
}
