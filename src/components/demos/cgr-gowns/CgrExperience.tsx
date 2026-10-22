"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_BADGE, DEMO_DISCLAIMER } from "@/lib/demos";
import {
  GOWN,
  GOWN_POSTER_SIZE,
  SAMPLE_GOWNS,
  SAMPLE_LABEL,
  WEEK_DAYS,
} from "@/lib/cgr-gowns";
import { TIARA_IMAGE_SIZE, TIARA_IMAGE_SRC } from "@/lib/cgr-tiara-image";
import { EarringsArt, GownArt } from "./GownArt";
import { MessengerSheet, ReserveSheet } from "./SampleSheets";
import { warmFull } from "./mediapipe-warm";
import { startGown } from "./gown-prefetch";

// Camera + tracker code only downloads when someone heads for the button.
const TiaraTryOn = dynamic(
  () => import("./TiaraTryOn").then((m) => m.TiaraTryOn),
  { ssr: false },
);

type Sheet = { kind: "reserve"; gown?: string } | { kind: "messenger" } | null;

/**
 * 360° gown. Nothing 3D loads up front. model-viewer, the Draco decoder and
 * the .glb download together, in parallel (gown-prefetch.ts), only when
 *  - phones (coarse pointer or viewport under 768px): the visitor taps, focuses
 *    or presses Enter on "Tap to spin 360°". Never on scroll or idle.
 *  - desktop: the viewer frame is at least 20% on screen (IntersectionObserver,
 *    no rootMargin, no timer), or the same tap / focus on the poster.
 * Until then the poster still (or, for the placeholder, an SVG silhouette)
 * holds the same fixed-aspect box (CLS 0). The frame is the poster's own gray,
 * so neither the poster nor the 3D render reads as a box, and the poster
 * cross-fades out once the model has rendered (no flash).
 */
const PHONE_QUERY = "(pointer: coarse), (max-width: 767px)";
function GownViewer() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [modelSrc, setModelSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(false);
  // Auto-rotate starts only once model-viewer has swapped its poster for the
  // first rendered frame, so the handoff is front view to front view (r5).
  const [revealed, setRevealed] = useState(false);
  // Start the downloads in the event handler itself (not after a re-render).
  const arm = useCallback(() => {
    startGown().catch(() => {});
    setArmed(true);
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    // Phones never auto-load the 3D gown: tap only. (No IntersectionObserver:
    // the poster button still loads it.)
    if (
      !el ||
      window.matchMedia(PHONE_QUERY).matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.2)) {
          io.disconnect();
          startGown().catch(() => {});
          setArmed(true);
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!armed) return;
    let live = true;
    // Viewer code, .glb and Draco all download in parallel (gown-prefetch.ts);
    // usually already started by the pointerdown that armed us.
    startGown()
      .then(({ src }) => {
        if (!live) return;
        setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        setModelSrc(src);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [armed]);

  const onModel = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    el.addEventListener("load", () => setLoaded(true), { once: true });
    el.addEventListener("poster-dismissed", () => setRevealed(true), { once: true });
    el.addEventListener("error", () => setFailed(true), { once: true });
  }, []);

  return (
    <figure className="cg-viewer">
      <div className="cg-viewer-frame" ref={frameRef} data-gown-viewer="">
        {modelSrc ? (
          <model-viewer
            ref={onModel}
            className="cg-model"
            src={modelSrc}
            alt={GOWN.alt}
            {...(GOWN.poster ? { poster: GOWN.poster } : {})}
            loading="eager"
            camera-controls=""
            {...(reduced || !revealed ? {} : { "auto-rotate": "" })}
            auto-rotate-delay="900"
            rotation-per-second="18deg"
            interaction-prompt="none"
            touch-action="pan-y"
            camera-orbit="0deg 85deg auto"
            min-camera-orbit="auto 60deg auto"
            max-camera-orbit="auto 100deg auto"
            field-of-view="auto"
            shadow-intensity="0.9"
            shadow-softness="0.8"
            exposure="1.05"
            disable-pan=""
          >
            {GOWN.poster ? (
              // Same webp in model-viewer's poster slot, framed exactly like
              // the overlay below, so its built-in poster never ghosts.
              <div slot="poster" className="cg-mv-poster" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="cg-poster-img"
                  src={GOWN.poster}
                  alt=""
                  width={GOWN_POSTER_SIZE.width}
                  height={GOWN_POSTER_SIZE.height}
                  decoding="async"
                />
              </div>
            ) : null}
          </model-viewer>
        ) : null}
        <div
          className={`cg-poster${armed ? " is-loading" : ""}${loaded ? " is-done" : ""}`}
          aria-hidden={loaded ? true : undefined}
        >
          {GOWN.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="cg-poster-img"
              src={GOWN.poster}
              alt=""
              width={GOWN_POSTER_SIZE.width}
              height={GOWN_POSTER_SIZE.height}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <svg className="cg-poster-art" viewBox="0 0 200 260" aria-hidden="true" focusable="false">
              <path
                d="M84 40 Q100 34 116 40 L118 96 Q100 102 82 96 Z M82 96 Q100 102 118 96 C124 140 120 178 114 198 C132 222 152 238 166 250 Q100 260 34 250 C48 238 68 222 86 198 C80 178 76 140 82 96 Z"
                fill="currentColor"
              />
            </svg>
          )}
          {loaded ? null : failed ? (
            <p className="cg-poster-msg">The 3D gown couldn&apos;t load here.</p>
          ) : armed ? (
            <p className="cg-poster-msg" role="status" aria-label="Loading the 3D gown">
              Loading 3D…
            </p>
          ) : (
            <button
              type="button"
              className="cg-btn cg-btn-light cg-poster-btn"
              onPointerDown={arm}
              onFocus={arm}
              onClick={arm}
            >
              Tap to spin 360°
            </button>
          )}
        </div>
        <p className="cg-viewer-badge" aria-hidden="true">
          360° · drag
        </p>
      </div>
      <figcaption className="cg-viewer-cap">
        <span>Drag to turn the gown all the way around.</span>
        <span className="cg-viewer-note">{GOWN.note}</span>
      </figcaption>
    </figure>
  );
}

function MessengerIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="M10 2C5.6 2 2 5.3 2 9.4c0 2.3 1.1 4.4 2.9 5.7V18l2.7-1.5c.8.2 1.6.3 2.4.3 4.4 0 8-3.3 8-7.4S14.4 2 10 2Zm.8 9.9-2-2.2-4 2.2 4.4-4.7 2.1 2.2 3.9-2.2-4.4 4.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Reserve + Messenger, both SAMPLE placeholders that open inert sheets. */
function ContactActions({
  onReserve,
  onMessenger,
  className,
}: {
  onReserve: () => void;
  onMessenger: () => void;
  className?: string;
}) {
  return (
    <div className={`cg-contact ${className ?? ""}`}>
      <button type="button" className="cg-btn cg-btn-dark" onClick={onReserve}>
        Reserve <span className="cg-btn-tag">sample</span>
      </button>
      <button type="button" className="cg-btn cg-btn-msg" onClick={onMessenger}>
        <MessengerIcon />
        Messenger <span className="cg-btn-tag">sample</span>
      </button>
    </div>
  );
}

function WeekDots({ week }: { week: readonly boolean[] }) {
  return (
    <ol className="cg-week" aria-label="This week, sample availability">
      {WEEK_DAYS.map((d, i) => (
        <li
          key={d}
          className={week[i] ? "is-free" : "is-booked"}
          aria-label={`${d}: ${week[i] ? "free" : "booked"}`}
        >
          <span>{d.slice(0, 1)}</span>
        </li>
      ))}
    </ol>
  );
}

export function CgrExperience() {
  const [tryOn, setTryOn] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const open = useCallback(() => setTryOn(true), []);
  const close = useCallback(() => setTryOn(false), []);
  const closeSheet = useCallback(() => setSheet(null), []);
  const reserve = useCallback((gown?: string) => setSheet({ kind: "reserve", gown }), []);
  const messenger = useCallback(() => setSheet({ kind: "messenger" }), []);
  const overlayOpen = tryOn || sheet !== null;

  // The face model + wasm load on tap / pointerdown / focus of a Try button.
  // Desktop also warms them when the try-on section scrolls into view; phones
  // (coarse pointer or under 768px) never do: tap only (r5).
  useEffect(() => {
    const section = document.getElementById("cg-tryon-section");
    if (
      !section ||
      window.matchMedia(PHONE_QUERY).matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          warmFull();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  const tryProps = (i: number) => ({
    "data-try-tiara": i,
    onPointerDown: warmFull,
    onFocus: warmFull,
    onClick: open,
    type: "button" as const,
  });

  return (
    <div className="cg-root">
      <div className="cg-bar" inert={overlayOpen}>
        <div className="cg-bar-inner">
          <span className="cg-bar-full">
            {DEMO_BADGE} · KantoCo sample, not the shop&apos;s site
          </span>
          <span className="cg-bar-short">{DEMO_BADGE} · KantoCo sample</span>
        </div>
      </div>

      <main className="cg-main" inert={overlayOpen}>
        <section className="cg-hero cg-wrap">
          <div className="cg-hero-copy">
            <p className="cg-eyebrow">Gown rentals · Cavite</p>
            <h1 className="cg-title">
              CGR <span>Cavite Gown Rentals</span>
            </h1>
            <p className="cg-lede">
              See the gown from every side, try a tiara on live with your phone
              camera, then check the dates and reserve.
            </p>
            <div className="cg-actions">
              <button {...tryProps(0)} className="cg-btn cg-btn-primary">
                Try the tiara
              </button>
              <ContactActions onReserve={() => reserve()} onMessenger={messenger} />
            </div>
            <p className="cg-small">
              Try-on uses your front camera. Nothing is recorded or sent.
            </p>

            <div className="cg-hero-cards">
              <div className="cg-mini">
                <p className="cg-mini-h">
                  Red sequin mermaid this week{" "}
                  <span className="cg-sample-tag">{SAMPLE_LABEL}</span>
                </p>
                <WeekDots week={SAMPLE_GOWNS[0].week} />
                <p className="cg-mini-key">
                  <span className="cg-key is-free" /> Free{" "}
                  <span className="cg-key is-booked" /> Booked
                </p>
              </div>
              <div className="cg-mini cg-mini-tiara">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={TIARA_IMAGE_SRC}
                  alt="Teal crystal tiara"
                  width={TIARA_IMAGE_SIZE.width}
                  height={TIARA_IMAGE_SIZE.height}
                  decoding="async"
                />
                <p className="cg-mini-h">Pairs with: teal crystal tiara</p>
              </div>
            </div>
          </div>
          <GownViewer />
        </section>

        <section className="cg-how cg-wrap" aria-labelledby="cg-how-h">
          <h2 id="cg-how-h" className="cg-h2">
            How it works
          </h2>
          <ol className="cg-steps">
            <li>
              <span className="cg-step-n">1</span>
              <h3>Turn the gown</h3>
              <p>Drag the 3D gown to see the back, sides and train.</p>
            </li>
            <li>
              <span className="cg-step-n">2</span>
              <h3>Try the tiara</h3>
              <p>Your front camera puts the tiara on your head, live.</p>
            </li>
            <li>
              <span className="cg-step-n">3</span>
              <h3>Check the dates</h3>
              <p>See which days each gown is free this week.</p>
            </li>
            <li>
              <span className="cg-step-n">4</span>
              <h3>Reserve or message</h3>
              <p>Hold the gown, or ask CGR on Messenger first.</p>
            </li>
          </ol>
        </section>

        <section className="cg-catalog cg-wrap" aria-labelledby="cg-cat-h">
          <div className="cg-sec-head">
            <h2 id="cg-cat-h" className="cg-h2">
              Gowns &amp; accessories
            </h2>
            <p className="cg-sample-tag">Sample catalogue</p>
          </div>
          <ul className="cg-grid">
            {SAMPLE_GOWNS.map((g) => (
              <li key={g.id} className="cg-card">
                <div className="cg-card-art">
                  <GownArt shape={g.shape} color={g.color} shade={g.shade} title={g.name} />
                </div>
                <h3 className="cg-card-h">{g.name}</h3>
                <p className="cg-card-note">{g.note}</p>
                <WeekDots week={g.week} />
                <button
                  type="button"
                  className="cg-btn cg-btn-small"
                  onClick={() => reserve(g.id)}
                >
                  Reserve <span className="cg-btn-tag">sample</span>
                </button>
              </li>
            ))}
            <li className="cg-card">
              <div className="cg-card-art cg-card-art-wide">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={TIARA_IMAGE_SRC}
                  alt="Gold tiara set with teal crystals"
                  width={TIARA_IMAGE_SIZE.width}
                  height={TIARA_IMAGE_SIZE.height}
                  decoding="async"
                />
              </div>
              <h3 className="cg-card-h">Teal crystal tiara</h3>
              <p className="cg-card-note">Try it on live</p>
              <button {...tryProps(2)} className="cg-btn cg-btn-small">
                Try the tiara
              </button>
            </li>
            <li className="cg-card">
              <div className="cg-card-art cg-card-art-wide">
                <EarringsArt />
              </div>
              <h3 className="cg-card-h">Teal drop earrings</h3>
              <p className="cg-card-note">Matches the tiara</p>
              <button
                type="button"
                className="cg-btn cg-btn-small"
                onClick={() => reserve()}
              >
                Reserve <span className="cg-btn-tag">sample</span>
              </button>
            </li>
          </ul>
        </section>

        <section id="cg-tryon-section" className="cg-tiara cg-wrap" aria-labelledby="cg-tiara-h">
          <div className="cg-tiara-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="cg-tiara-img"
              src={TIARA_IMAGE_SRC}
              alt="Gold tiara set with teal crystals"
              width={TIARA_IMAGE_SIZE.width}
              height={TIARA_IMAGE_SIZE.height}
              decoding="async"
            />
          </div>
          <div className="cg-tiara-copy">
            <h2 id="cg-tiara-h" className="cg-h2">
              The teal crystal tiara
            </h2>
            <p>
              Gold band, teal crystal drops. Tap Try the tiara and it sits on
              your head in the camera view. It tilts and turns as you move.
            </p>
            <button {...tryProps(1)} className="cg-btn cg-btn-primary">
              Try the tiara
            </button>
            <p className="cg-after-h">Like it? Hold the gown or ask first.</p>
            <ContactActions onReserve={() => reserve()} onMessenger={messenger} />
          </div>
        </section>

        <section className="cg-avail cg-wrap" aria-labelledby="cg-avail-h">
          <div className="cg-sec-head">
            <h2 id="cg-avail-h" className="cg-h2">
              Availability this week
            </h2>
            <p className="cg-sample-tag">
              {SAMPLE_LABEL}, not CGR&apos;s real calendar
            </p>
          </div>
          <p className="cg-swipe-hint" aria-hidden="true">
            <span>Swipe the table to see all 7 days</span>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M5 12h13m-5-5 5 5-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </p>
          <div className="cg-table-scroller">
            <div
              className="cg-table-wrap"
              role="region"
              aria-label="Sample availability, Monday to Sunday. Scrolls sideways on small screens."
              tabIndex={0}
              onScroll={(e) => {
                const el = e.currentTarget;
                el.parentElement?.classList.toggle(
                  "is-end",
                  el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
                );
              }}
            >
              <table className="cg-table">
                <thead>
                  <tr>
                    <th scope="col">Gown</th>
                    {WEEK_DAYS.map((d) => (
                      <th key={d} scope="col">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_GOWNS.map((g) => (
                    <tr key={g.id}>
                      <th scope="row">
                        <span className="cg-swatch" style={{ background: g.color }} />
                        {g.name}
                      </th>
                      {g.week.map((free, i) => (
                        <td key={WEEK_DAYS[i]}>
                          <span className={`cg-cell ${free ? "is-free" : "is-booked"}`}>
                            {free ? "Free" : "Booked"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <button
            type="button"
            className="cg-btn cg-btn-dark"
            onClick={() => reserve()}
          >
            Reserve a free day <span className="cg-btn-tag">sample</span>
          </button>
        </section>

        {/* r5: SAMPLE visit info. Placeholder details only: no real CGR phone,
            address or links, and nothing here is a tel:/mailto:/map link. */}
        <section className="cg-info cg-wrap" aria-labelledby="cg-info-h">
          <div className="cg-sec-head">
            <h2 id="cg-info-h" className="cg-h2">
              Hours, location &amp; contact
            </h2>
            <p className="cg-sample-tag">Sample details, not CGR&apos;s real info</p>
          </div>
          <ul className="cg-info-cols">
            <li className="cg-info-col">
              <h3>Hours</h3>
              <dl className="cg-info-dl">
                <div>
                  <dt>Mon–Sat</dt>
                  <dd>10:00 AM – 7:00 PM</dd>
                </div>
                <div>
                  <dt>Sun</dt>
                  <dd>Fittings by appointment</dd>
                </div>
              </dl>
              <p className="cg-info-note">Sample hours</p>
            </li>
            <li className="cg-info-col">
              <h3>Location</h3>
              <p>
                Sample Street, Brgy. Sample
                <br />
                Cavite, Philippines
              </p>
              <p className="cg-info-note">Placeholder address, no map</p>
            </li>
            <li className="cg-info-col">
              <h3>Contact</h3>
              <p>
                Phone: <span className="cg-info-fake">09XX XXX XXXX</span>
                <br />
                Email: <span className="cg-info-fake">hello@sample.invalid</span>
              </p>
              <p className="cg-info-note">Placeholders, not linked</p>
              <button type="button" className="cg-btn cg-btn-small" onClick={messenger}>
                Messenger <span className="cg-btn-tag">sample</span>
              </button>
            </li>
          </ul>
        </section>

        <section className="cg-privacy-block cg-wrap" aria-labelledby="cg-priv-h">
          <h2 id="cg-priv-h" className="cg-h2">
            Your camera stays on your phone
          </h2>
          <ul className="cg-priv-cols">
            <li>
              <h3>On your phone</h3>
              <p>The face tracker runs inside your browser, on your phone.</p>
            </li>
            <li>
              <h3>Nothing saved</h3>
              <p>No video or photo is recorded, saved or uploaded.</p>
            </li>
            <li>
              <h3>Off when you close</h3>
              <p>The camera turns off as soon as you close the try-on.</p>
            </li>
          </ul>
        </section>
      </main>

      <footer className="cg-footer cg-wrap" inert={overlayOpen}>
        <p>{DEMO_DISCLAIMER}</p>
        <p>
          Reserve, Messenger and availability are sample placeholders. They
          aren&apos;t connected to CGR.
        </p>
      </footer>

      {tryOn ? <TiaraTryOn onClose={close} /> : null}
      {sheet?.kind === "reserve" ? (
        <ReserveSheet onClose={closeSheet} initialGown={sheet.gown} />
      ) : null}
      {sheet?.kind === "messenger" ? <MessengerSheet onClose={closeSheet} /> : null}
    </div>
  );
}
