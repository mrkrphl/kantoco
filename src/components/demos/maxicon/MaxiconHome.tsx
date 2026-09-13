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
const IRIS_END = 0.12;

const BEATS = [
  { id: "open", start: 0.03, end: 0.22, hold: false, motion: "wipe" },
  { id: "heat", start: 0.27, end: 0.46, hold: false, motion: "blur" },
  { id: "bayan", start: 0.51, end: 0.7, hold: false, motion: "rise" },
  { id: "cta", start: 0.75, end: 1, hold: true, motion: "draw" },
] as const;

function seekVideo(video: HTMLVideoElement, time: number) {
  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) return;
  const next = Math.min(Math.max(time, 0), duration);
  if (Math.abs(video.currentTime - next) < 0.008) return;
  video.currentTime = next;
}

function armInlinePlayback(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
}

async function unlockSeek(video: HTMLVideoElement, time: number) {
  armInlinePlayback(video);
  try {
    await video.play();
  } catch {
    /* iOS may still block until a later gesture */
  }
  video.pause();
  seekVideo(video, time);
}

function pinProgress(pin: HTMLElement) {
  const travel = pin.offsetHeight - window.innerHeight;
  if (travel <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / travel));
}

function beatLocal(progress: number, start: number, end: number) {
  if (progress < start) return -1;
  if (progress > end) return 2;
  return (progress - start) / (end - start);
}

function applyBeat(
  el: HTMLElement,
  t: number,
  motion: (typeof BEATS)[number]["motion"],
  hold: boolean,
) {
  const name = el.querySelector<HTMLElement>(".maxicon-reel-name");
  const line = el.querySelector<HTMLElement>(".maxicon-reel-line");
  const rule = el.querySelector<HTMLElement>(".maxicon-reel-rule");
  const extra = el.querySelector<HTMLElement>(".maxicon-reel-extra");
  const active = t >= 0 && (t <= 1 || hold);
  if (!active) {
    gsap.set(el, {
      autoAlpha: 0,
      visibility: "hidden",
      clipPath: "none",
      filter: "none",
      y: 0,
    });
    return;
  }

  const enter = gsap.utils.clamp(0, 1, t <= 1 ? t / 0.3 : 1);
  const exit = hold || t > 1 ? 0 : gsap.utils.clamp(0, 1, (t - 0.74) / 0.26);
  const shown = enter * (1 - exit);

  gsap.set(el, { visibility: "visible", autoAlpha: shown > 0.02 ? 1 : 0 });

  if (rule) gsap.set(rule, { scaleX: shown, transformOrigin: "left center" });

  if (motion === "wipe") {
    const edge = (1 - enter) * 100 + exit * 100;
    gsap.set(el, {
      clipPath: `inset(0 ${Math.min(edge, 100)}% 0 0)`,
      filter: "none",
      y: 0,
    });
    if (name) {
      gsap.set(name, {
        letterSpacing: `${(0.14 * (1 - enter) - 0.035).toFixed(3)}em`,
        y: 0,
        filter: "none",
      });
    }
    if (line) gsap.set(line, { y: 18 * (1 - enter) + exit * -16, autoAlpha: shown });
    return;
  }

  if (motion === "blur") {
    const blur = (1 - enter) * 12 + exit * 10;
    const y = (1 - enter) * 36 + exit * -28;
    gsap.set(el, { clipPath: "none", filter: `blur(${blur.toFixed(1)}px)`, y });
    if (name) gsap.set(name, { letterSpacing: "-0.03em", y: 0, filter: "none" });
    if (line) {
      const lineEnter = gsap.utils.clamp(0, 1, (enter - 0.18) / 0.82);
      gsap.set(line, { y: 14 * (1 - lineEnter), autoAlpha: lineEnter * (1 - exit) });
    }
    return;
  }

  if (motion === "rise") {
    const fromBottom = (1 - enter) * 100;
    gsap.set(el, {
      clipPath: `inset(${fromBottom}% 0 ${exit * 100}% 0)`,
      filter: "none",
      y: 0,
    });
    if (name) gsap.set(name, { letterSpacing: "-0.035em", y: 10 * (1 - enter), filter: "none" });
    if (line) gsap.set(line, { y: 16 * (1 - enter), autoAlpha: shown });
    return;
  }

  gsap.set(el, { clipPath: "none", filter: "none", y: 12 * (1 - enter) });
  if (name) {
    gsap.set(name, {
      letterSpacing: `${(0.08 * (1 - enter) - 0.03).toFixed(3)}em`,
      y: 0,
      filter: "none",
    });
  }
  if (line) gsap.set(line, { y: 10 * (1 - enter), autoAlpha: shown });
  if (extra) gsap.set(extra, { y: 16 * (1 - enter), autoAlpha: shown });
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

    let cancelled = false;
    let started = false;

    const markReady = () => {
      if (started) return;
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      started = true;
      void (async () => {
        await unlockSeek(video, 0);
        if (!cancelled) setReelReady(true);
      })();
    };

    if (video.readyState >= 1) markReady();
    video.addEventListener("loadedmetadata", markReady);
    video.addEventListener("error", () => setReelFailed(true));

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", markReady);
    };
  }, []);

  useEffect(() => {
    const pin = pinRef.current;
    const video = videoRef.current;
    if (!pin || !video || reduced || reelFailed || !reelReady) return;

    let used = false;
    let confirmed = false;

    const retryIfStuck = () => {
      if (used || confirmed) return;
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      const expected = pinProgress(pin) * video.duration;
      if (expected <= 0.12) return;
      if (Math.abs(video.currentTime - expected) <= 0.25) {
        confirmed = true;
        return;
      }
      used = true;
      armInlinePlayback(video);
      const playAttempt = video.play();
      void Promise.resolve(playAttempt)
        .catch(() => {})
        .then(() => {
          video.pause();
          seekVideo(video, pinProgress(pin) * video.duration);
        });
    };

    pin.addEventListener("pointerdown", retryIfStuck, { passive: true });
    pin.addEventListener("touchstart", retryIfStuck, { passive: true });
    window.addEventListener("scroll", retryIfStuck, { passive: true });

    return () => {
      pin.removeEventListener("pointerdown", retryIfStuck);
      pin.removeEventListener("touchstart", retryIfStuck);
      window.removeEventListener("scroll", retryIfStuck);
    };
  }, [reduced, reelReady, reelFailed]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const pin = pinRef.current;
      const video = videoRef.current;
      if (!root || !pin || !video || reduced || reelFailed) return;

      video.pause();
      video.muted = true;

      const iris = pin.querySelector<HTMLElement>(".maxicon-reel-iris");
      const cue = pin.querySelector<HTMLElement>(".maxicon-reel-cue");
      const beats = pin.querySelectorAll<HTMLElement>("[data-beat]");

      const apply = (progress: number) => {
        const duration = video.duration;
        if (Number.isFinite(duration) && duration > 0) {
          seekVideo(video, progress * duration);
        }

        const irisT = gsap.utils.clamp(0, 1, progress / IRIS_END);
        const irisEase = irisT ** 1.65;
        const radius = gsap.utils.interpolate(6.5, 158, irisEase);
        const irisX = gsap.utils.interpolate(56, 50, irisEase);
        const irisY = gsap.utils.interpolate(36, 42, irisEase);
        if (iris) {
          gsap.set(iris, {
            clipPath: `circle(${radius.toFixed(2)}% at ${irisX.toFixed(1)}% ${irisY.toFixed(1)}%)`,
          });
        }

        const scale = 1.08 - 0.08 * progress;
        const posX = 46 + 12 * progress;
        const posY = 40 - 10 * progress;
        gsap.set(video, {
          scale,
          transformOrigin: "56% 36%",
          force3D: true,
        });
        video.style.objectPosition = `${posX.toFixed(1)}% ${posY.toFixed(1)}%`;

        beats.forEach((el) => {
          const spec = BEATS.find((b) => b.id === el.dataset.beat);
          if (!spec) return;
          applyBeat(el, beatLocal(progress, spec.start, spec.end), spec.motion, spec.hold);
        });

        if (cue) {
          const cueIn = gsap.utils.clamp(0, 1, progress / 0.02);
          const cueOut = gsap.utils.clamp(0, 1, (progress - 0.02) / 0.07);
          gsap.set(cue, { autoAlpha: cueIn * (1 - cueOut) });
        }
      };

      const st = ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
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
          <div className="maxicon-reel-sticky">
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
              <div className="maxicon-reel-iris">
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
                  {...{ "webkit-playsinline": "true" }}
                >
                  <source src={REEL_SRC} type="video/mp4" />
                </video>
              </div>
            )}

            <div className="maxicon-reel-veil" aria-hidden />

            {staticCopy ? (
              <div className="maxicon-reel-copy maxicon-reel-copy--static">
                <span className="maxicon-reel-rule" aria-hidden />
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
                    <span className="maxicon-reel-rule" aria-hidden />
                    <h1 className="maxicon-reel-name">{maxicon.name}</h1>
                    <p className="maxicon-reel-line">The product is cold.</p>
                  </div>
                  <div className="maxicon-reel-beat" data-beat="heat">
                    <span className="maxicon-reel-rule" aria-hidden />
                    <p className="maxicon-reel-name">Hina na sa traffic?</p>
                    <p className="maxicon-reel-line">Weak A/C. They fix that.</p>
                  </div>
                  <div className="maxicon-reel-beat" data-beat="bayan">
                    <span className="maxicon-reel-rule" aria-hidden />
                    <p className="maxicon-reel-name">President’s Avenue.</p>
                    <p className="maxicon-reel-line">
                      BF Homes, Parañaque. Bayan work.
                    </p>
                  </div>
                  <div className="maxicon-reel-beat" data-beat="cta">
                    <span className="maxicon-reel-rule" aria-hidden />
                    <p className="maxicon-reel-name">Bring it in.</p>
                    <div className="maxicon-reel-extra">
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
                </div>
              </>
            )}
          </div>
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
