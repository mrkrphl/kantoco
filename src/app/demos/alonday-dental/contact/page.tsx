import { AlondayShell } from "@/components/demos/alonday/AlondayShell";
import { AlondayVisit } from "@/components/demos/alonday/AlondayVisit";
import { alonday } from "@/lib/alonday";

export default function AlondayContact() {
  return (
    <AlondayShell current="Visit">
      <AlondayVisit id="contact" />
      <iframe
        title="Map of 454 El Grande Ave., BF Homes, Parañaque"
        src={alonday.mapsEmbed}
        className="alonday-map"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </AlondayShell>
  );
}
