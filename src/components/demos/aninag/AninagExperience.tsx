import Image from "next/image";
import Link from "next/link";
import { DEMO_BADGE, DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

export function AninagExperience() {
  return (
    <div className="aninag">
      <p className="aninag-banner">{DEMO_DISCLAIMER}</p>

      <div className="aninag-top">
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.16em" }}>{DEMO_BADGE}</p>
          <h1 className="aninag-word">Aninag</h1>
          <p className="aninag-kicker">
            Sample loft off Sucat Road, San Antonio, Parañaque. Portraits on
            paper and product stills under one tungsten and one gel. Fictional
            block. Not a real studio.
          </p>
        </div>
        <div className="aninag-sheet">
          <div className="aninag-frame" style={{ minHeight: "12rem" }}>
            <Image
              src="/demos/aninag-studio/studio-room.jpg"
              alt="Empty photo studio with a white cyc wall, softboxes, and a lighting grid"
              fill
              sizes="(min-width: 880px) 40vw, 100vw"
              preload
            />
          </div>
          <div className="aninag-frame">
            <Image
              src="/demos/aninag-studio/loft-lights.jpg"
              alt="Industrial studio loft with stands, softboxes, and cable on concrete"
              fill
              sizes="(min-width: 880px) 25vw, 50vw"
            />
          </div>
          <div className="aninag-frame">
            <Image
              src="/demos/aninag-studio/camera.jpg"
              alt="Black Canon body with a Sigma zoom facing the lens"
              fill
              sizes="(min-width: 880px) 25vw, 50vw"
            />
          </div>
        </div>
      </div>

      <section className="aninag-rest">
        <div className="aninag-rest-inner">
          <h2>Paper, tungsten, and one gel</h2>
          <p style={{ marginTop: "0.9rem" }}>
            Hours are printed only. Tuesday to Sunday, 10:00-19:00. Closed
            Monday. No live booking and no shop phone.
          </p>
          <dl className="aninag-readout">
            <dt>Open</dt>
            <dd>Tue-Sun 10:00-19:00</dd>
            <dt>Work</dt>
            <dd>Headshots against the cyc, plus product on black.</dd>
            <dt>Print</dt>
            <dd>Contact sheets on darkroom paper.</dd>
          </dl>
          <ul className="aninag-jobs">
            <li>
              <span>01</span> Headshots against the cyc, with no cream backdrop.
            </li>
            <li>
              <span>02</span> Product on black, lit with one tungsten and one
              cyan gel.
            </li>
            <li>
              <span>03</span> Contact sheets printed on darkroom paper.
            </li>
          </ul>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="aninag-cta"
          >
            Message us on Facebook
          </a>
          <p className="aninag-foot">
            {DEMO_DISCLAIMER}{" "}
            <Link href="/">Back to KantoCo</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
