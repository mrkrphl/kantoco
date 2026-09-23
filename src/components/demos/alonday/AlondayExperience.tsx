"use client";

import Image from "next/image";
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
      const bay = root.querySelector<HTMLElement>(".alonday-opener-bay");
      const still = root.querySelector<HTMLElement>(".alonday-opener-photo");
      const copy = root.querySelector<HTMLElement>(".alonday-opener-copy");

      if (reduced) return;
      if (!pin || !bay || !still || !copy) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 720px)", () => {
        gsap.set(still, { scale: 1.02, transformOrigin: "50% 48%" });
        gsap.set(bay, {
          clipPath: "inset(0% 100% 0% 0%)",
        });
        gsap.set(copy, { autoAlpha: 0, x: -24 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: "+=120%",
            pin: true,
            pinSpacing: true,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            id: "alonday-light-bay",
          },
        });

        tl.to(still, { scale: 1, duration: 1 }, 0);
        tl.to(
          bay,
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.78,
            },
          0,
        );
        tl.to(
          copy,
          { autoAlpha: 1, x: 0, duration: 0.3, ease: "power2.out" },
          0.44,
        );
      });

      mm.add("(max-width: 719px)", () => {
        gsap.set(still, { scale: 1.02, transformOrigin: "50% 48%" });
        gsap.set(bay, {
          clipPath: "inset(100% 0% 0% 0%)",
        });
        gsap.set(copy, { autoAlpha: 0, y: 20 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: "+=120%",
            pin: true,
            pinSpacing: true,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            id: "alonday-light-bay-m",
          },
        });

        tl.to(still, { scale: 1, duration: 1 }, 0);
        tl.to(
          bay,
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.78,
          },
          0,
        );
        tl.to(
          copy,
          { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
          0.42,
        );
      });

      root.querySelectorAll<HTMLElement>("[data-beat]").forEach((beat) => {
        const frame = beat.querySelector<HTMLElement>("[data-beat-still]");
        const words = gsap.utils.toArray<HTMLElement>(
          "[data-beat-word], [data-beat-line]",
          beat,
        );

        ScrollTrigger.create({
          trigger: beat,
          start: "top top",
          end: "+=90%",
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        if (frame) {
          gsap.fromTo(
            frame,
            { scale: 1.08 },
            {
              scale: 1,
              ease: "none",
              immediateRender: false,
              scrollTrigger: {
                trigger: beat,
                start: "top top",
                end: "+=90%",
                scrub: 0.5,
              },
            },
          );
        }

        words.forEach((el, i) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 22 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              delay: i * 0.06,
              ease: "power3.out",
              immediateRender: false,
              scrollTrigger: {
                trigger: beat,
                start: "top 72%",
                toggleActions: "play none none reverse",
              },
            },
          );
        });
      });

      const refresh = () => ScrollTrigger.refresh();
      root.querySelectorAll("img").forEach((img) => {
        if (img.complete) return;
        img.addEventListener("load", refresh, { once: true });
      });
      requestAnimationFrame(refresh);

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
          <div className="alonday-opener-still">
            <div className="alonday-opener-photo">
              <Image
                src={alonday.stills.hero}
                alt="Finished after-filling smile, cropped from a public Alonday Facebook still"
                fill
                sizes="100vw"
                preload
                className="alonday-opener-img"
              />
            </div>
            <div className="alonday-opener-shade" aria-hidden />
          </div>

          <div className="alonday-opener-bay">
            <div className="alonday-opener-wash" aria-hidden />
            <div className="alonday-opener-copy">
              <p className="alonday-kicker">{DEMO_BADGE}</p>
              <h1 className="alonday-name">
                {alonday.shortName}
                <span>Dental Clinic</span>
              </h1>
              <p className="alonday-promise">{alonday.promise}</p>
              <p className="alonday-place">{alonday.addressShort}</p>
              <div className="alonday-ctas">
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

      <section
        className="alonday-beat alonday-beat--photo"
        data-beat
        aria-label="Composite"
      >
        <div className="alonday-beat-still">
          <div data-beat-still className="alonday-beat-photo">
            <Image
              src={alonday.stills.composite}
              alt="Close crop of a finished composite on a molar, from a public Facebook still"
              fill
              sizes="(min-width: 720px) 54vw, 100vw"
              className="alonday-beat-img alonday-beat-img--molar"
            />
          </div>
        </div>
        <div className="alonday-beat-copy">
          <p className="alonday-kicker">The work</p>
          <h2 className="alonday-loud" data-beat-word>
            Composite
          </h2>
          <p className="alonday-sentence" data-beat-line>
            A molar they already posted, finished and quiet. This is chair work
            from their own still, not a whitening ad.
          </p>
        </div>
      </section>

      <section
        className="alonday-beat alonday-beat--photo alonday-beat--flip"
        data-beat
        aria-label="Crowns"
      >
        <div className="alonday-beat-still">
          <div data-beat-still className="alonday-beat-photo">
            <Image
              src={alonday.stills.crowns}
              alt="Close crop of a finished porcelain-fused-to-metal smile, from a public Facebook still"
              fill
              sizes="(min-width: 720px) 54vw, 100vw"
              className="alonday-beat-img alonday-beat-img--crowns"
            />
          </div>
        </div>
        <div className="alonday-beat-copy">
          <p className="alonday-kicker">The work</p>
          <h2 className="alonday-loud" data-beat-word>
            Crowns
          </h2>
          <p className="alonday-sentence" data-beat-line>
            Porcelain fused to metal, from a case on their Facebook. The after
            is the only thing printed large here.
          </p>
        </div>
      </section>

      <section
        className="alonday-beat alonday-beat--type"
        data-beat
        aria-label="Hours"
      >
        <div className="alonday-beat-copy alonday-beat-copy--wide">
          <p className="alonday-kicker">Hours</p>
          <h2 className="alonday-loud" data-beat-word>
            {alonday.hoursLoud}
          </h2>
          <p className="alonday-time" data-beat-word>
            {alonday.hoursTime}
          </p>
          <p className="alonday-sentence" data-beat-line>
            {alonday.hoursNote}
          </p>
        </div>
      </section>

      <section
        className="alonday-beat alonday-beat--type"
        data-beat
        aria-label="Location"
      >
        <div className="alonday-beat-copy alonday-beat-copy--wide">
          <p className="alonday-kicker">Location</p>
          <h2 className="alonday-loud" data-beat-word>
            <span className="alonday-num">{alonday.streetNumber}</span>{" "}
            {alonday.streetName}
          </h2>
          <p className="alonday-sentence" data-beat-line>
            {alonday.address}. A neighborhood clinic on El Grande Avenue in BF
            Homes — look for the number, then confirm on Facebook if you are
            walking in.
          </p>
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

      <section
        className="alonday-beat alonday-beat--type"
        data-beat
        aria-label="Contact"
      >
        <div className="alonday-beat-copy alonday-beat-copy--wide">
          <p className="alonday-kicker">Contact</p>
          <h2 className="alonday-loud alonday-loud--dial" data-beat-word>
            <a href={alonday.phoneHref}>{alonday.phoneDisplay}</a>
          </h2>
          <p className="alonday-sentence" data-beat-line>
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
          .
        </p>
        <p>
          <Link href="/">Back to the agency</Link>
        </p>
      </footer>
    </div>
  );
}
