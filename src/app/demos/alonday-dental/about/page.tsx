import { AlondayShell } from "@/components/demos/alonday/AlondayShell";
import { alonday } from "@/lib/alonday";

export default function AlondayAbout() {
  return (
    <AlondayShell current="About">
      <div className="alonday-page">
        <p className="alonday-kicker">About</p>
        <h1 className="alonday-title">
          {alonday.name} sits on El Grande Avenue.
        </h1>
        <p className="alonday-lede">
          Their public logo card names {alonday.dentistOnCard} and associates.
          People find the clinic on Facebook, Instagram, and the phone number
          on that card. They do not publish a marketing site. This page is a
          KantoCo sample of how that clinic could look on the web.
        </p>
        <figure className="alonday-placeholder">
          <div className="alonday-placeholder-frame">
            <p>photo-12.jpg</p>
            <p>Reception team portrait — placeholder only.</p>
          </div>
          <figcaption>
            A public Facebook still of two people at the reception desk is
            reserved as photo-12 (fbid 1111227657686954). Names are not
            confirmed. Do not treat this as a staff bio.
          </figcaption>
        </figure>
        <p className="alonday-note alonday-foot">{alonday.sampleNote}</p>
      </div>
    </AlondayShell>
  );
}
