import { MaxiconShell } from "@/components/demos/maxicon/MaxiconShell";
import { maxicon } from "@/lib/maxicon";

export default function MaxiconContact() {
  return (
    <MaxiconShell current="Visit">
      <div className="maxicon-page">
        <p className="maxicon-kicker">Visit</p>
        <h1 className="maxicon-display maxicon-title">
          Call the mobile. Facebook is the live page.
        </h1>
        <p className="maxicon-lede">
          {maxicon.sampleNote} The numbers and the street below are public. We
          did not invent a second address.
        </p>

        <div className="maxicon-visit-grid mt-12">
          <section className="maxicon-card">
            <h2 className="maxicon-display text-3xl">Hours</h2>
            <p className="mt-3">{maxicon.hours}</p>
            <p className="mt-2 text-sm text-[var(--mute)]">
              From their Facebook intro. Directories that stretch the day to
              6pm were left out.
            </p>
          </section>
          <section className="maxicon-card">
            <h2 className="maxicon-display text-3xl">Address</h2>
            <p className="mt-3">{maxicon.address}</p>
            <p className="mt-3">
              <a
                href={maxicon.mapsQuery}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[var(--accent)] underline-offset-4"
              >
                Open map
              </a>
            </p>
          </section>
          <section className="maxicon-card">
            <h2 className="maxicon-display text-3xl">Phone</h2>
            <p className="mt-3">
              <a href={maxicon.phoneMobileHref} className="underline underline-offset-4">
                {maxicon.phoneMobileDisplay}
              </a>
            </p>
            <p className="mt-2 text-sm text-[var(--mute)]">
              Tel/fax{" "}
              <a href={maxicon.phoneLandlineHref} className="underline underline-offset-4">
                {maxicon.phoneLandlineDisplay}
              </a>
              {" / "}
              {maxicon.phoneLandlineAlt}. Their old Wix page also lists{" "}
              {maxicon.phoneWix}.
            </p>
          </section>
          <section className="maxicon-card">
            <h2 className="maxicon-display text-3xl">Write</h2>
            <p className="mt-3">
              <a href={maxicon.emailHref} className="underline underline-offset-4">
                {maxicon.email}
              </a>
            </p>
            <p className="mt-2 text-sm text-[var(--mute)]">
              {maxicon.cards} Facebook: {maxicon.facebookFollowers}.
            </p>
          </section>
        </div>

        <iframe
          title="Map of 45 President's Avenue, BF Homes, Parañaque"
          src={maxicon.mapsEmbed}
          className="maxicon-map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        <div className="maxicon-cta-row">
          <a href={maxicon.phoneMobileHref} className="maxicon-cta">
            Call {maxicon.phoneMobileDisplay}
          </a>
          <a
            href={maxicon.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="maxicon-cta-ghost"
          >
            Facebook
          </a>
        </div>
        <p className="maxicon-note">
          KantoCo sample only.{" "}
          <a
            href={maxicon.kantocoMessenger}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message KantoCo
          </a>{" "}
          if you want a site like this. Never treat this URL as Maxicon’s live
          site.
        </p>
      </div>
    </MaxiconShell>
  );
}
