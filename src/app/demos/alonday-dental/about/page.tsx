import Image from "next/image";
import { AlondayShell } from "@/components/demos/alonday/AlondayShell";
import { alonday } from "@/lib/alonday";

export default function AlondayAbout() {
  return (
    <AlondayShell current="About">
      <div className="alonday-page">
        <p className="alonday-kicker">About</p>
        <h1 className="alonday-title">
          {alonday.name} sits at {alonday.address}.
        </h1>
        <p className="alonday-lede">
          They do not publish a marketing site. People find the clinic on
          Facebook, Instagram, a phone number, and a booking app they already
          run. The hanging sign on a public still of the front names{" "}
          {alonday.dentistSign}. Hours are posted on Facebook, not invented
          here.
        </p>
        <p className="alonday-lede">
          This is a KantoCo sample of how that neighborhood clinic could look
          on the web. It is not a live client site.
        </p>
      </div>
      <div className="alonday-page-still">
        <Image
          src="/demos/alonday-dental/facade.jpg"
          alt="White clinic bungalow with a green roof, a wooden door, and a hanging sign for Dr. Emma Aleli D. Alonday."
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <p className="alonday-note alonday-foot">{alonday.sampleNote}</p>
    </AlondayShell>
  );
}
