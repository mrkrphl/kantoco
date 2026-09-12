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

const REEL_SRC = "/demos/maxicon-car-aircon/cold-sequence.mp4";
const REEL_POSTER = "/demos/maxicon-car-aircon/cold-poster.jpg";

function seekVideo(video: HTMLVideoElement, time: number) {
  const next = Math.min(Math.max(time, 0), Math.max(video.duration - 0.001, 0));
  if (Math.abs(video.currentTime - next) < 0.01) return;
  video.currentTime = next;
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
    if (!video || reduced) return;

    const markReady = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.pause();
        video.muted = true;
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

      const apply = (progress: number) => {
        const duration = video.duration;
        if (!Number.isFinite(duration) || duration <= 0) return;
        seekVideo(video, progress * duration);
        if (cue) {
          gsap.set(cue, { autoAlpha: 1 - Math.min(progress / 0.08, 1) });
        }
      };

      const st = ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * 2.6)}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.35,
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

  const staticLanding = reduced || reelFailed;
  const motion = staticLanding ? "static" : reelReady ? "ready" : "pending";

  return (
    <div ref={rootRef} className="maxicon" data-motion={motion}>
      <MaxiconBanner over fixed />
      <main>
        {staticLanding ? null : (
          <section
            ref={pinRef}
            className="maxicon-reel-pin"
            aria-label="Cold-air sequence. Scroll to move through the film."
          >
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
            <p className="maxicon-reel-cue">Scroll</p>
          </section>
        )}

        <section
          id="visit"
          className="maxicon-bay-land"
          aria-label="Maxicon’s bay on President’s Avenue"
        >
          <Image
            src="/demos/maxicon-car-aircon/shop-front.jpg"
            alt="Maxicon’s open bay and sign on President’s Avenue, BF Homes."
            fill
            className="object-cover object-[center_28%]"
            sizes="100vw"
            preload
          />
          <div className="maxicon-hero">
            <div className="maxicon-hero-copy">
              <h1 className="maxicon-hero-name">{maxicon.name}</h1>
              <p className="maxicon-hero-line">{maxicon.heroLine}</p>
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
