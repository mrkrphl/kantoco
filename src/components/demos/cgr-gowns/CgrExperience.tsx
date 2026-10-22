"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { DEMO_BADGE, DEMO_DISCLAIMER } from "@/lib/demos";
import { GOWN_IS_PLACEHOLDER, GOWN_MODEL_SRC } from "@/lib/cgr-gowns";
import { TIARA_IMAGE_SIZE, TIARA_IMAGE_SRC } from "@/lib/cgr-tiara-image";

// Camera + tracker code only downloads when someone taps "Try the tiara".
const TiaraTryOn = dynamic(
  () => import("./TiaraTryOn").then((m) => m.TiaraTryOn),
  { ssr: false },
);

function GownViewer() {
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let live = true;
    import("@google/model-viewer")
      .then(() => {
        if (!live) return;
        setReduced(
          window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        );
        setReady(true);
      })
      .catch(() => {
        /* viewer stays as the static fallback card */
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <figure className="cg-viewer">
      <div className="cg-viewer-frame">
        {ready ? (
          <model-viewer
            className="cg-model"
            src={GOWN_MODEL_SRC}
            alt="A red ball gown on a stand, shown in 3D. Drag to turn it."
            camera-controls=""
            {...(reduced ? {} : { "auto-rotate": "" })}
            auto-rotate-delay="0"
            rotation-per-second="18deg"
            interaction-prompt="none"
            touch-action="pan-y"
            camera-orbit="20deg 78deg auto"
            min-camera-orbit="auto 60deg auto"
            max-camera-orbit="auto 100deg auto"
            field-of-view="auto"
            shadow-intensity="0.9"
            shadow-softness="0.8"
            exposure="1.05"
            disable-pan=""
          />
        ) : (
          <p className="cg-viewer-wait">Loading the 3D gown…</p>
        )}
      </div>
      <figcaption className="cg-viewer-cap">
        <span>Drag to turn the gown all the way around.</span>
        {GOWN_IS_PLACEHOLDER ? (
          <span className="cg-viewer-note">
            Stand-in model. The real CGR gown in 3D goes here.
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function CgrExperience() {
  const [tryOn, setTryOn] = useState(false);
  const open = useCallback(() => setTryOn(true), []);
  const close = useCallback(() => setTryOn(false), []);

  return (
    <div className="cg-root">
      <div className="cg-bar" inert={tryOn}>
        <div className="cg-bar-inner">
          <span className="cg-bar-full">
            {DEMO_BADGE} · KantoCo sample, not the shop&apos;s site
          </span>
          <span className="cg-bar-short">{DEMO_BADGE} · KantoCo sample</span>
        </div>
      </div>

      <main className="cg-main" inert={tryOn}>
        <section className="cg-hero cg-wrap">
          <div className="cg-hero-copy">
            <p className="cg-eyebrow">Gown rentals · Cavite</p>
            <h1 className="cg-title">
              CGR <span>Cavite Gown Rentals</span>
            </h1>
            <p className="cg-lede">
              See the gown from every side, then try a tiara on live with your
              phone camera before you visit.
            </p>
            <div className="cg-actions">
              <button
                type="button"
                className="cg-btn cg-btn-primary"
                onClick={open}
              >
                Try the tiara
              </button>
            </div>
            <p className="cg-small">
              Works on your phone&apos;s front camera. Nothing is recorded or
              sent.
            </p>
          </div>
          <GownViewer />
        </section>

        <section className="cg-tiara cg-wrap" aria-labelledby="cg-tiara-h">
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
            <button type="button" className="cg-btn" onClick={open}>
              Try the tiara
            </button>
          </div>
        </section>

        <section className="cg-privacy-block cg-wrap" aria-labelledby="cg-priv-h">
          <h2 id="cg-priv-h" className="cg-h2">
            Your camera stays on your phone
          </h2>
          <ul className="cg-list">
            <li>The face tracker runs inside your browser.</li>
            <li>No video or photo is recorded, saved or uploaded.</li>
            <li>The camera turns off as soon as you close the try-on.</li>
          </ul>
        </section>
      </main>

      <footer className="cg-footer cg-wrap" inert={tryOn}>
        <p>{DEMO_DISCLAIMER}</p>
      </footer>

      {tryOn ? <TiaraTryOn onClose={close} /> : null}
    </div>
  );
}
