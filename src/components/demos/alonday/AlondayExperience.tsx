"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { alonday } from "@/lib/alonday";
import { waitForOpenerLine } from "@/lib/motion";
import { DEMO_BADGE, DEMO_DISCLAIMER } from "@/lib/demos";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const drawEase = "cubic-bezier(.22,1,.36,1)";

function drawLine(el: Element | null) {
  el?.classList.add("is-drawn");
}

export function AlondayExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    let live = true;
    waitForOpenerLine().then(() => {
      if (!live) return;
      const name = root.querySelector<HTMLElement>(".alonday-name");
      if (!name) return;
      drawLine(name);
      gsap.to(name, { opacity: 1, duration: 0.9, ease: drawEase });
    });
    return () => {
      live = false;
    };
  }, [reduced]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready) return;

      const pin = root.querySelector<HTMLElement>(".alonday-opener-pin");
      const rest = gsap.utils.toArray<HTMLElement>(
        ".alonday-clinic, .alonday-promise, .alonday-place, .alonday-opener-ctas",
        root,
      );
      const glow = root.querySelector<HTMLElement>(".alonday-opener-glow");
      const tick = root.querySelector<HTMLElement>(".alonday-opener-tick");

      if (reduced) return;
      if (!pin || !glow) return;

      const buildOpener = (id: string, vh: number) => {
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

      const fitGap = () => {
        const pinEl = root.querySelector<HTMLElement>(".alonday-opener-pin");
        const ctas = root.querySelector<HTMLElement>(".alonday-opener-ctas");
        const treat = root.querySelector<HTMLElement>(".alonday-section--treat");
        if (!pinEl || !ctas || !treat) return;
        treat.style.marginTop = "0px";
        const spaceBelow =
          pinEl.getBoundingClientRect().bottom - ctas.getBoundingClientRect().bottom;
        const padTop = Number.parseFloat(getComputedStyle(treat).paddingTop) || 0;
        const gap = spaceBelow + padTop;
        const target = window.matchMedia("(max-width: 719px)").matches
          ? 64
          : 100;
        if (gap > target) {
          treat.style.marginTop = `${Math.round(target - gap)}px`;
        }
      };

      const mm = gsap.matchMedia();
      mm.add("(min-width: 720px)", () => buildOpener("alonday-line", 0.8));
      mm.add("(max-width: 719px)", () => buildOpener("alonday-line-m", 0.65));
      ScrollTrigger.addEventListener("refresh", fitGap);

      ScrollTrigger.batch(".alonday-treat-row .alonday-line", {
        start: "top 85%",
        once: true,
        onEnter: (els) => {
          els.forEach((el, i) => {
            gsap.delayedCall(i * 0.08, () => drawLine(el));
          });
        },
      });

      root.querySelectorAll<HTMLElement>("[data-draw]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 75%",
          once: true,
          onEnter: () => drawLine(el),
        });
      });

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        fitGap();
      });

      return () => {
        ScrollTrigger.removeEventListener("refresh", fitGap);
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
          <div className="alonday-wrap alonday-opener-copy">
            <div className="alonday-opener-stack">
              <div className="alonday-opener-glow" aria-hidden />
              <p className="alonday-kicker">{DEMO_BADGE}</p>
              <div className="alonday-name-block">
                <span className="alonday-opener-tick" aria-hidden />
                <h1 className="alonday-name alonday-line">{alonday.shortName}</h1>
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

      <section
        className="alonday-section alonday-section--treat"
        aria-label="What they treat"
      >
        <div className="alonday-wrap">
          <p className="alonday-kicker alonday-kicker--tick">
            <span className="alonday-section-tick" aria-hidden />
            What they treat
          </p>
          <ol className="alonday-treat">
            {alonday.treatments.map((row) => (
              <li key={row.n} className="alonday-treat-row">
                <span className="alonday-treat-num">{row.n}</span>
                <div className="alonday-treat-main">
                  <h2 className="alonday-treat-name alonday-line">{row.name}</h2>
                </div>
                <p className="alonday-treat-desc">{row.descriptor}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="alonday-section" aria-label="Case notes">
        <div className="alonday-wrap">
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

      <section className="alonday-visit" aria-label="Visit">
        <div className="alonday-wrap">
          <p className="alonday-kicker alonday-kicker--tick">
            <span className="alonday-section-tick" aria-hidden />
            Visit
          </p>
          <div className="alonday-visit-grid">
            <div className="alonday-visit-main">
              <p className="alonday-kicker">Call or message</p>
              <div className="alonday-visit-number">
                <div className="alonday-visit-glow" aria-hidden />
                <a
                  href={alonday.phoneHref}
                  className="alonday-visit-dial alonday-line"
                  data-draw
                >
                  {alonday.phoneDisplay}
                </a>
              </div>
              <div className="alonday-ctas alonday-visit-ctas">
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
              <p className="alonday-visit-note">{alonday.visitNote}</p>
            </div>
            <div className="alonday-visit-side">
              <div className="alonday-visit-block">
                <p className="alonday-kicker alonday-kicker--tick">
                  <span className="alonday-section-tick" aria-hidden />
                  Hours
                </p>
                <p className="alonday-visit-heading">{alonday.hoursHeading}</p>
                <p className="alonday-visit-body">{alonday.hoursBody}</p>
              </div>
              <div className="alonday-visit-block">
                <p className="alonday-kicker alonday-kicker--tick">
                  <span className="alonday-section-tick" aria-hidden />
                  Address
                </p>
                <p className="alonday-visit-heading">{alonday.address}</p>
                <a
                  href={alonday.mapsQuery}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="alonday-map-link"
                >
                  Open the map
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="alonday-foot">
        <div className="alonday-wrap">
          <span
            className="alonday-foot-rule alonday-line"
            data-draw
            aria-hidden
          />
          <div className="alonday-foot-grid">
            <p className="alonday-foot-copy">{alonday.sampleNote}</p>
            <p className="alonday-foot-links">
              <a
                href={alonday.kantocoMessenger}
                target="_blank"
                rel="noopener noreferrer"
              >
                Message KantoCo
              </a>
              <Link href="/">Back to the agency</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
