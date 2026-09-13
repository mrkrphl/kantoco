"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MaxiconBanner } from "@/components/demos/maxicon/MaxiconShell";
import { maxicon } from "@/lib/maxicon";
import { useMotionReady } from "@/components/motion/useMotionReady";

const VENT_SRC = "/demos/maxicon-car-aircon/cold-vent.mp4";
const VENT_POSTER = "/demos/maxicon-car-aircon/cold-vent-poster.jpg";

function armInlinePlayback(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
}

function useFadeIn(rootRef: React.RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    const nodes = root.querySelectorAll<HTMLElement>("[data-fade]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
    );

    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [enabled, rootRef]);
}

export function MaxiconHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { reduced } = useMotionReady();
  const [videoFailed, setVideoFailed] = useState(false);

  useFadeIn(rootRef, !reduced);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced || videoFailed) return;

    armInlinePlayback(video);
    const tryPlay = () => {
      void video.play().catch(() => {
        /* Poster stays. Do not retry against the autoplay policy. */
      });
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay);
    return () => video.removeEventListener("canplay", tryPlay);
  }, [reduced, videoFailed]);

  const staticHero = reduced || videoFailed;

  return (
    <div
      ref={rootRef}
      className="maxicon"
      data-motion={staticHero ? "static" : "ready"}
    >
      <MaxiconBanner over fixed />
      <main>
        <section className="maxicon-hero" aria-label="Maxicon car aircon">
          {staticHero ? (
            <Image
              src={
                videoFailed
                  ? "/demos/maxicon-car-aircon/maxicon-bay.jpg"
                  : VENT_POSTER
              }
              alt=""
              fill
              className="maxicon-hero-media"
              sizes="100vw"
              preload
            />
          ) : (
            <video
              ref={videoRef}
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
              onError={() => setVideoFailed(true)}
              {...{ "webkit-playsinline": "true" }}
            >
              <source src={VENT_SRC} type="video/mp4" />
            </video>
          )}
          <div className="maxicon-hero-veil" aria-hidden />
          <div className="maxicon-hero-copy">
            <p className="maxicon-hero-kicker">
              Car aircon · BF Homes, Parañaque
            </p>
            <h1 className="maxicon-hero-name">{maxicon.name}</h1>
            <p className="maxicon-hero-line">{maxicon.heroLine}</p>
            <div className="maxicon-hero-actions">
              <a
                href={maxicon.kantocoMessenger}
                target="_blank"
                rel="noopener noreferrer"
                className="maxicon-hero-call"
              >
                Message KantoCo
              </a>
            </div>
          </div>
        </section>

        <section className="maxicon-band" data-fade aria-label="The work">
          <p className="maxicon-visit-kicker">In the bay</p>
          <p className="maxicon-band-title">
            They sell the part. They also open the system.
          </p>
          <p className="maxicon-lede">
            Compressors, condensers, fans, evaporators, valves, driers — OEM
            and replacement, sitting on the same floor as the cars. A job
            starts with an evaluation. Cleaning and a repair follow if the
            system needs it. There are no sample rates on this page. A live
            shop writes its own board.
          </p>
        </section>

        <section className="maxicon-proof" data-fade aria-label="Shop still">
          <div className="maxicon-proof-frame">
            <Image
              src="/demos/maxicon-car-aircon/maxicon-bay.jpg"
              alt="A technician in a Maxicon shirt working under the open hood of a Toyota."
              fill
              className="object-cover object-[center_28%]"
              sizes="100vw"
            />
          </div>
          <p className="maxicon-caption">
            Their public Facebook is the live record — {maxicon.facebookFollowers}
            . {maxicon.recentPost} The still is theirs.
          </p>
        </section>

        <section id="visit" className="maxicon-visit" data-fade aria-label="Visit">
          <p className="maxicon-visit-kicker">{maxicon.address}</p>
          <p className="maxicon-mono maxicon-hours">{maxicon.hours}</p>
          <a href={maxicon.phoneMobileHref} className="maxicon-dial">
            {maxicon.phoneMobileDisplay}
          </a>
          <a
            href={maxicon.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="maxicon-facebook"
          >
            Facebook
          </a>
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
