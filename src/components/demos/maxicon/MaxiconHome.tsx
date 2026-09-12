"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MaxiconBanner } from "@/components/demos/maxicon/MaxiconShell";
import { maxicon } from "@/lib/maxicon";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const REEL_SRC = "/demos/maxicon-car-aircon/cold-vent.mp4";
const REEL_POSTER = "/demos/maxicon-car-aircon/cold-vent-poster.jpg";
const PIN_VIEWS = 3.2;

const BEATS = [
  { start: 0, end: 0.2 },
  { start: 0.2, end: 0.45 },
  { start: 0.45, end: 0.7 },
  { start: 0.7, end: 1 },
] as const;

function seekVideo(video: HTMLVideoElement, time: number) {
  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) return;
  const next = Math.min(Math.max(time, 0), duration);
  if (Math.abs(video.currentTime - next) < 0.008) return;
  video.currentTime = next;
}

function beatAlpha(progress: number, start: number, end: number, fade = 0.055) {
  const holdLast = end >= 0.999;
  if (progress < start) return 0;
  if (!holdLast && progress > end) return 0;
  const fadeIn = start === 0 ? 1 : Math.min(1, (progress - start) / fade);
  const fadeOut = holdLast ? 1 : Math.min(1, (end - progress) / fade);
  return Math.max(0, Math.min(fadeIn, fadeOut));
}

export function MaxiconHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { reduced } = useMotionReady();
  const [reelReady, setReelReady] = useState(false);
  const [reelFailed, setReelFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.pause();
        video.muted = true;
        if (reduced) seekVideo(video, 0);
        setReelReady(true);
      }
    };

    if (video.readyState >= 1) markReady();
    video.addEventListener("loadedmetadata", markReady);
    video.addEventListener("error", () => setReelFailed(true));

    return () => {
      video.removeEventListener("loadedmetadata", markReady);
    };
  }, [reduced]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const pin = pinRef.current;
      const video = videoRef.current;
      if (!root || !pin || !video || reduced || reelFailed) return;

      video.pause();
      video.muted = true;

      const cue = pin.querySelector<HTMLElement>(".maxicon-reel-cue");
      const beats = pin.querySelectorAll<HTMLElement>("[data-beat]");

      const apply = (progress: number) => {
        const duration = video.duration;
        if (Number.isFinite(duration) && duration > 0) {
          seekVideo(video, progress * duration);
        }
        beats.forEach((el, i) => {
          const range = BEATS[i];
          if (!range) return;
          gsap.set(el, { autoAlpha: beatAlpha(progress, range.start, range.end) });
        });
        if (cue) {
          gsap.set(cue, { autoAlpha: 1 - Math.min(progress / 0.08, 1) });
        }
      };

      const st = ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * PIN_VIEWS)}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });

      apply(st.progress);
      if (reelReady) ScrollTrigger.refresh();

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("resize", refresh);
      window.visualViewport?.addEventListener("resize", refresh);

      return () => {
        window.removeEventListener("resize", refresh);
        window.visualViewport?.removeEventListener("resize", refresh);
      };
    },
    { scope: rootRef, dependencies: [reduced, reelReady, reelFailed] },
  );

  const staticCopy = reduced || reelFailed;
  const motion = staticCopy ? "static" : reelReady ? "ready" : "pending";

  return (
    <div ref={rootRef} className="maxicon" data-motion={motion}>
      <MaxiconBanner over fixed />
      <main>
        <section
          ref={pinRef}
          className="maxicon-reel-pin"
          aria-label="Cold air from a dashboard vent. Scroll to play the film."
        >
          {reelFailed ? (
            <Image
              src="/demos/maxicon-car-aircon/shop-front.jpg"
              alt=""
              fill
              className="maxicon-reel-fallback"
              sizes="100vw"
              preload
            />
          ) : (
            <video
              ref={videoRef}
              className="maxicon-reel"
              muted
              playsInline
              preload="auto"
              poster={REEL_POSTER}
              disablePictureInPicture
              controls={false}
              tabIndex={-1}
              aria-hidden
            >
              <source src={REEL_SRC} type="video/mp4" />
            </video>
          )}

          <div className="maxicon-reel-veil" aria-hidden />

          {staticCopy ? (
            <div className="maxicon-reel-copy maxicon-reel-copy--static">
              <h1 className="maxicon-reel-name">{maxicon.name}</h1>
              <p className="maxicon-reel-line">The product is cold.</p>
              <div className="maxicon-hero-actions">
                <a href={maxicon.phoneMobileHref} className="maxicon-hero-call">
                  Call {maxicon.phoneMobileDisplay}
                </a>
                <a
                  href={maxicon.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="maxicon-hero-fb"
                >
                  Facebook
                </a>
              </div>
              <p className="maxicon-hero-meta">
                <span>{maxicon.hours}</span>
                <span aria-hidden>·</span>
                <a
                  href={maxicon.mapsQuery}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="maxicon-hero-map"
                >
                  Map
                </a>
              </p>
            </div>
          ) : (
            <>
              <p className="maxicon-reel-cue">Scroll</p>
              <div className="maxicon-reel-copy">
                <div className="maxicon-reel-beat" data-beat="open">
                  <h1 className="maxicon-reel-name">{maxicon.name}</h1>
                  <p className="maxicon-reel-line">The product is cold.</p>
                </div>
                <div className="maxicon-reel-beat" data-beat="heat">
                  <p className="maxicon-reel-name">Hina na sa traffic?</p>
                  <p className="maxicon-reel-line">They bring the cold back.</p>
                </div>
                <div className="maxicon-reel-beat" data-beat="bayan">
                  <p className="maxicon-reel-name">
                    President’s Avenue, BF Homes.
                  </p>
                  <p className="maxicon-reel-line">Parañaque. Bayan work.</p>
                </div>
                <div className="maxicon-reel-beat" data-beat="cta">
                  <p className="maxicon-reel-name">Bring it in.</p>
                  <div className="maxicon-hero-actions">
                    <a
                      href={maxicon.phoneMobileHref}
                      className="maxicon-hero-call"
                    >
                      Call {maxicon.phoneMobileDisplay}
                    </a>
                    <a
                      href={maxicon.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="maxicon-hero-fb"
                    >
                      Facebook
                    </a>
                  </div>
                  <p className="maxicon-hero-meta">
                    <span>{maxicon.hours}</span>
                    <span aria-hidden>·</span>
                    <a
                      href={maxicon.mapsQuery}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="maxicon-hero-map"
                    >
                      Map
                    </a>
                  </p>
                </div>
              </div>
            </>
          )}
        </section>

        <section id="visit" className="maxicon-after" aria-label="Visit">
          <p className="maxicon-visit-kicker">{maxicon.address}</p>
          <p className="maxicon-mono maxicon-hours">{maxicon.hours}</p>
        </section>

        <p className="maxicon-note maxicon-foot">
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
      </main>
    </div>
  );
}
