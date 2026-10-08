"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { alonday } from "@/lib/alonday";
import { DEMO_BADGE, DEMO_DISCLAIMER } from "@/lib/demos";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function AlondayExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready) return;

      const pin = root.querySelector<HTMLElement>(".alonday-opener-pin");
      const name = root.querySelector<HTMLElement>(".alonday-name");
      const line = root.querySelector<HTMLElement>(".alonday-hairline");
      const rest = gsap.utils.toArray<HTMLElement>(
        ".alonday-clinic, .alonday-promise, .alonday-place, .alonday-opener-ctas",
        root,
      );
      const glow = root.querySelector<HTMLElement>(".alonday-opener-glow");
      const tick = root.querySelector<HTMLElement>(".alonday-opener-tick");

      if (reduced) return;
      if (!pin || !name || !line || !glow) return;

      const buildOpener = (id: string, vh: number) => {
        gsap.set(name, { opacity: 0.4 });
        gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
        gsap.set(rest, { autoAlpha: 0, y: 16 });
        gsap.set(glow, { opacity: 0 });
        if (tick) gsap.set(tick, { opacity: 0, scaleY: 0.4 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * vh)}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            id,
          },
        });

        tl.to(
          line,
          { scaleX: 1, duration: 0.35, ease: "power2.out" },
          0,
        );
        tl.to(name, { opacity: 1, duration: 0.3, ease: "power1.out" }, 0.35);
        tl.to(
          rest,
          { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
          0.38,
        );
        tl.to(glow, { opacity: 1, duration: 0.55, ease: "power1.out" }, 0.45);
        if (tick) {
          tl.to(
            tick,
            { opacity: 1, scaleY: 1, duration: 0.4, ease: "power2.out" },
            0.48,
          );
        }
      };

      const mm = gsap.matchMedia();
      mm.add("(min-width: 720px)", () => buildOpener("alonday-line", 1.4));
      mm.add("(max-width: 719px)", () => buildOpener("alonday-line-m", 1.2));

      root.querySelectorAll<HTMLElement>("[data-draw]").forEach((row) => {
        const mark = row.querySelector<HTMLElement>(".alonday-draw");
        const ink = gsap.utils.toArray<HTMLElement>(".alonday-ink", row);
        if (!mark) return;

        gsap.set(mark, { scaleX: 0, transformOrigin: "left center" });
        if (ink.length) gsap.set(ink, { opacity: 0.45 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: row,
            start: "top 75%",
            end: () => `+=${Math.round(window.innerHeight * 0.25)}`,
            scrub: 0.45,
            invalidateOnRefresh: true,
          },
        });

        tl.to(mark, { scaleX: 1, ease: "power2.out" }, 0);
        if (ink.length) tl.to(ink, { opacity: 1, ease: "power1.out" }, 0);
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        mm.revert();
      };
    },
    { scope: rootRef, dependencies: [ready, reduced] },
  );

  const motion = reduced ? "static" : ready ? "ready" : "pending";

  return (
    <div ref={rootRef} className="alonday" data-motion={motion}>
      <p className="alonday-banner">
        <strong>{DEMO_BADGE}</strong>
        <span>{DEMO_DISCLAIMER}</span>
      </p>

      <section className="alonday-opener" aria-label="Alonday Dental Clinic">
        <div className="alonday-opener-pin">
          <div className="alonday-opener-copy">
            <div className="alonday-opener-stack">
              <div className="alonday-opener-glow" aria-hidden />
              <p className="alonday-kicker">{DEMO_BADGE}</p>
              <div className="alonday-name-block">
                <span className="alonday-opener-tick" aria-hidden />
                <h1 className="alonday-name">{alonday.shortName}</h1>
                <span className="alonday-hairline" aria-hidden />
              </div>
              <p className="alonday-clinic">Dental Clinic</p>
              <p className="alonday-promise">{alonday.promise}</p>
              <p className="alonday-place">{alonday.addressShort}</p>
              <div className="alonday-ctas alonday-opener-ctas">
                <a href={alonday.phoneHref} className="alonday-btn alonday-btn--fill">
                  Call {alonday.phoneDisplay}
                </a>
                <a
                  href={alonday.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="alonday-btn alonday-btn--line"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="alonday-section" aria-label="What they treat">
        <div className="alonday-section-inner">
          <p className="alonday-kicker alonday-kicker--tick">
            <span className="alonday-section-tick" aria-hidden />
            What they treat
          </p>
          <ol className="alonday-treat">
            {alonday.treatments.map((row) => (
              <li key={row.n} className="alonday-treat-row" data-draw>
                <span className="alonday-treat-num">{row.n}</span>
                <div className="alonday-treat-main">
                  <h2 className="alonday-treat-name alonday-ink">{row.name}</h2>
                  <span className="alonday-draw" aria-hidden />
                </div>
                <p className="alonday-treat-desc">{row.descriptor}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="alonday-section" aria-label="Case notes">
        <div className="alonday-section-inner">
          <p className="alonday-kicker alonday-kicker--tick">
            <span className="alonday-section-tick" aria-hidden />
            Case notes · from their Facebook
          </p>
          <div className="alonday-notes">
            {alonday.notes.map((note) => (
              <article key={note.title} className="alonday-note">
                <h2 className="alonday-note-title">“{note.title}”</h2>
                <p className="alonday-note-body">{note.body}</p>
              </article>
            ))}
          </div>
          <p className="alonday-note-attr">{alonday.notesAttribution}</p>
        </div>
      </section>

      <section className="alonday-section" aria-label="Hours">
        <div className="alonday-section-inner alonday-section-inner--narrow">
          <p className="alonday-kicker alonday-kicker--tick">
            <span className="alonday-section-tick" aria-hidden />
            Hours
          </p>
          <h2 className="alonday-loud">{alonday.hoursLoud}</h2>
          <div className="alonday-mark" data-draw>
            <p className="alonday-time">{alonday.hoursTime}</p>
            <span className="alonday-draw alonday-draw--time" aria-hidden />
          </div>
          <p className="alonday-sentence">{alonday.hoursWalkins}</p>
          <p className="alonday-sentence">{alonday.hoursConfirm}</p>
        </div>
      </section>

      <section className="alonday-section" aria-label="Location">
        <div className="alonday-section-inner alonday-section-inner--narrow">
          <p className="alonday-kicker alonday-kicker--tick">
            <span className="alonday-section-tick" aria-hidden />
            Location
          </p>
          <h2 className="alonday-loud">
            <span className="alonday-num">{alonday.streetNumber}</span>{" "}
            <span className="alonday-street" data-draw>
              {alonday.streetName}
              <span className="alonday-draw alonday-draw--street" aria-hidden />
            </span>
          </h2>
          <p className="alonday-sentence">{alonday.address}</p>
          <p className="alonday-sentence">{alonday.locationNote}</p>
          <a
            href={alonday.mapsQuery}
            target="_blank"
            rel="noopener noreferrer"
            className="alonday-text-link"
          >
            Open the map
          </a>
        </div>
      </section>

      <section className="alonday-section" aria-label="Contact">
        <div className="alonday-section-inner alonday-section-inner--narrow">
          <p className="alonday-kicker alonday-kicker--tick">
            <span className="alonday-section-tick" aria-hidden />
            Contact
          </p>
          <div className="alonday-mark" data-draw>
            <h2 className="alonday-loud alonday-loud--dial">
              <a href={alonday.phoneHref}>{alonday.phoneDisplay}</a>
            </h2>
            <span className="alonday-draw alonday-draw--phone" aria-hidden />
          </div>
          <p className="alonday-sentence">
            Call the number on their card, or write them on Facebook. This
            sample does not take appointments.
          </p>
          <div className="alonday-ctas">
            <a href={alonday.phoneHref} className="alonday-btn alonday-btn--fill">
              Call {alonday.phoneDisplay}
            </a>
            <a
              href={alonday.messenger}
              target="_blank"
              rel="noopener noreferrer"
              className="alonday-btn alonday-btn--line"
            >
              Message on Facebook
            </a>
          </div>
        </div>
      </section>

      <footer className="alonday-foot">
        <p>
          {alonday.sampleNote}{" "}
          <a
            href={alonday.kantocoMessenger}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message KantoCo
          </a>
        </p>
        <p>
          <Link href="/">Back to the agency</Link>
        </p>
      </footer>
    </div>
  );
}
