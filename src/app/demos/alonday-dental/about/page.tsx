import Image from "next/image";
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
        <figure className="alonday-about-still">
          <Image
            src={alonday.stills.reception}
            alt="Reception desk at Alonday Dental Clinic, from a public Facebook still"
            width={482}
            height={600}
          />
          <figcaption>
            A public Facebook still from the reception desk (photo-12). Names
            are not confirmed. This is not a staff bio.
          </figcaption>
        </figure>
        <p className="alonday-note alonday-foot">{alonday.sampleNote}</p>
      </div>
    </AlondayShell>
  );
}
