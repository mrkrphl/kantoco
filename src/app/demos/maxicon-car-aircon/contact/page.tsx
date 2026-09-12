import { MaxiconShell } from "@/components/demos/maxicon/MaxiconShell";
import { MaxiconVisit } from "@/components/demos/maxicon/MaxiconVisit";
import { maxicon } from "@/lib/maxicon";

export default function MaxiconContact() {
  return (
    <MaxiconShell>
      <MaxiconVisit id="contact" />
      <iframe
        title="Map of 45 President's Avenue, BF Homes, Parañaque"
        src={maxicon.mapsEmbed}
        className="maxicon-map"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </MaxiconShell>
  );
}
