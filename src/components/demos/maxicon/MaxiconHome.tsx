"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { maxicon } from "@/lib/maxicon";
import { DEMO_BADGE } from "@/lib/demos";
import { useMotionReady } from "@/components/motion/useMotionReady";

const VENT_SRC = "/demos/maxicon-car-aircon/cold-vent.mp4";
const VENT_POSTER = "/demos/maxicon-car-aircon/cold-vent-poster.jpg";
const BAY_SRC = "/demos/maxicon-car-aircon/bay-work.mp4";
const BAY_POSTER = "/demos/maxicon-car-aircon/bay-work-poster.jpg";

function armInlinePlayback(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
}

function useLoopingVideo(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;

    armInlinePlayback(video);
    const tryPlay = () => {
      void video.play().catch(() => {
        /* Poster stays. Do not fight autoplay. */
      });
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay);
    return () => video.removeEventListener("canplay", tryPlay);
  }, [enabled, videoRef]);
}

export function MaxiconHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ventRef = useRef<HTMLVideoElement>(null);
  const bayRef = useRef<HTMLVideoElement>(null);
  const { reduced } = useMotionReady();
  const [ventFailed, setVentFailed] = useState(false);
  const [bayFailed, setBayFailed] = useState(false);

  const staticVent = reduced || ventFailed;
  const staticBay = reduced || bayFailed;

  useLoopingVideo(ventRef, !staticVent);
  useLoopingVideo(bayRef, !staticBay);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const nodes = root.querySelectorAll<HTMLElement>("[data-fade]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" },
    );

    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      className="maxicon"
      data-motion={reduced ? "static" : "ready"}
    >
      <main>
        <section className="maxicon-hero" aria-label="Maxicon car aircon">
          {staticVent ? (
            <Image
              src={VENT_POSTER}
              alt=""
              fill
              className="maxicon-hero-media"
              sizes="100vw"
              preload
            />
          ) : (
            <video
              ref={ventRef}
              className="maxicon-hero-media"
              muted
              playsInline
              loop
              autoPlay
              preload="auto"
              poster={VENT_POSTER}
              disablePictureInPicture
              controls={false}
              tabIndex={-1}
              aria-hidden
              onError={() => setVentFailed(true)}
              {...{ "webkit-playsinline": "true" }}
            >
              <source src={VENT_SRC} type="video/mp4" />
            </video>
          )}

          <div className="maxicon-hero-col">
            <p className="maxicon-hero-eye">
              {DEMO_BADGE} · Car aircon specialist
            </p>
            <h1 className="maxicon-hero-title">The product is cold.</h1>
            <p className="maxicon-hero-sub">Hina na sa traffic? Weak A/C.</p>
            <p className="maxicon-hero-meta">
              45 President’s Avenue · Mon–Sat 8–5
            </p>
            <a
              href={maxicon.kantocoMessenger}
              target="_blank"
              rel="noopener noreferrer"
              className="maxicon-hero-cta"
            >
              Message KantoCo
            </a>
            <a href={maxicon.phoneMobileHref} className="maxicon-hero-phone">
              {maxicon.phoneMobileDisplay}
            </a>
          </div>
        </section>

        <section className="maxicon-below" aria-label="The bay">
          <figure className="maxicon-bay" data-fade>
            <div className="maxicon-bay-frame">
              {staticBay ? (
                <Image
                  src={BAY_POSTER}
                  alt="Generated sample of bay work. Not shop footage."
                  fill
                  className="object-cover"
                  sizes="(min-width: 900px) 56rem, 100vw"
                />
              ) : (
                <video
                  ref={bayRef}
                  className="maxicon-bay-video"
                  muted
                  playsInline
                  loop
                  autoPlay
                  preload="metadata"
                  poster={BAY_POSTER}
                  disablePictureInPicture
                  controls={false}
                  onError={() => setBayFailed(true)}
                  {...{ "webkit-playsinline": "true" }}
                >
                  <source src={BAY_SRC} type="video/mp4" />
                </video>
              )}
            </div>
            <figcaption>Parts + service in the bay.</figcaption>
          </figure>

          <p className="maxicon-mono maxicon-below-line" data-fade>
            Repair · Cleaning · Parts
          </p>
          <p className="maxicon-mono maxicon-below-meta" data-fade>
            45 President’s Avenue · Mon–Sat 8–5
          </p>

          <p className="maxicon-foot" data-fade>
            {maxicon.sampleNote}{" "}
            <a
              href={maxicon.kantocoMessenger}
              target="_blank"
              rel="noopener noreferrer"
            >
              Message KantoCo
            </a>
            .
            <span className="maxicon-foot-back">
              <Link href="/">Back to the agency</Link>
            </span>
          </p>
        </section>
      </main>
    </div>
  );
}
