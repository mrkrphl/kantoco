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

const BAY_SRC = "/demos/maxicon-car-aircon/bay-work.mp4?g=12";
const BAY_POSTER = "/demos/maxicon-car-aircon/bay-work-poster.jpg";
const VENT_SRC = "/demos/maxicon-car-aircon/cold-vent.mp4?g=12";
const VENT_POSTER = "/demos/maxicon-car-aircon/cold-vent-poster.jpg";

const WIPE_START = 0.4;
const WIPE_END = 0.54;
/** Bay keeps moving through the wipe instead of parking on its last frame. */
const BAY_SCRUB_END = 0.58;
/** Vent starts before the wipe so it is already off frame 0 when it appears. */
const VENT_SCRUB_START = 0.32;

const BEATS = [
  { id: "heat", start: 0, end: 0.22, hold: false },
  { id: "bay", start: 0.14, end: 0.48, hold: false },
  { id: "cold", start: 0.38, end: 0.8, hold: false },
  { id: "cta", start: 0.7, end: 1, hold: true },
] as const;

const MARK = [
  { at: 0, x: 16, y: 38 },
  { at: 0.22, x: 22, y: 44 },
  { at: 0.34, x: 46, y: 48 },
  { at: 0.52, x: 58, y: 36 },
  { at: 0.7, x: 64, y: 32 },
  { at: 0.86, x: 12, y: 86 },
] as const;

/** Half a frame at 24fps — skip micro-seeks that thrash the decoder. */
const SEEK_EPS = 0.02;

type FastSeekVideo = HTMLVideoElement & {
  fastSeek?: (time: number) => void;
};

const pendingSeek = new WeakMap<HTMLVideoElement, number>();
const seekFlushArmed = new WeakSet<HTMLVideoElement>();

function armSeekFlush(video: HTMLVideoElement) {
  if (seekFlushArmed.has(video)) return;
  seekFlushArmed.add(video);
  video.addEventListener("seeked", () => {
    const queued = pendingSeek.get(video);
    if (queued == null) return;
    pendingSeek.delete(video);
    seekVideo(video, queued);
  });
}

function commitSeek(video: HTMLVideoElement, time: number) {
  const seekable = video as FastSeekVideo;
  if (typeof seekable.fastSeek === "function") {
    try {
      seekable.fastSeek(time);
      return;
    } catch {
      /* media not seekable yet */
    }
  }
  video.currentTime = time;
}

function seekVideo(video: HTMLVideoElement, time: number) {
  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) return;
  const next = Math.min(Math.max(time, 0), duration);
  if (Math.abs(video.currentTime - next) < SEEK_EPS) return;
  armSeekFlush(video);
  // One in-flight seek at a time — pile-ups keep painting the stale GOP.
  if (video.seeking) {
    pendingSeek.set(video, next);
    return;
  }
  pendingSeek.delete(video);
  commitSeek(video, next);
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

function remap(progress: number, start: number, end: number) {
  return gsap.utils.clamp(0, 1, (progress - start) / (end - start));
}

function bayPlayhead(progress: number, duration: number) {
  return remap(progress, 0, BAY_SCRUB_END) * duration;
}

function ventPlayhead(progress: number, duration: number) {
  return remap(progress, VENT_SCRUB_START, 1) * duration;
}

function beatLocal(progress: number, start: number, end: number) {
  if (progress < start) return -1;
  if (progress > end) return 2;
  return (progress - start) / (end - start);
}

function markAt(progress: number) {
  let a: (typeof MARK)[number] = MARK[0];
  let b: (typeof MARK)[number] = MARK[MARK.length - 1];
  for (let i = 0; i < MARK.length - 1; i += 1) {
    if (progress >= MARK[i].at && progress <= MARK[i + 1].at) {
      a = MARK[i];
      b = MARK[i + 1];
      break;
    }
  }
  const t = a.at === b.at ? 1 : remap(progress, a.at, b.at);
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    hide: progress > 0.8,
  };
}

function applyBeat(el: HTMLElement, t: number, hold: boolean, snapIn = false) {
  const name = el.querySelector<HTMLElement>(".maxicon-reel-name");
  const line = el.querySelector<HTMLElement>(".maxicon-reel-line");
  const extra = el.querySelector<HTMLElement>(".maxicon-reel-extra");
  const active = t >= 0 && (t <= 1 || hold);
  if (!active) {
    gsap.set(el, {
      autoAlpha: 0,
      visibility: "hidden",
      x: 0,
      y: 0,
      clipPath: "none",
      filter: "none",
    });
    return;
  }

  const enter = snapIn ? 1 : gsap.utils.clamp(0, 1, t <= 1 ? t / 0.28 : 1);
  const exit = hold || t > 1 ? 0 : gsap.utils.clamp(0, 1, (t - 0.76) / 0.24);
  const shown = enter * (1 - exit);
  const layout = el.dataset.layout;

  gsap.set(el, { visibility: "visible", autoAlpha: shown > 0.03 ? 1 : 0 });

  if (layout === "hero") {
    gsap.set(el, {
      x: -42 * (1 - enter) + exit * -24,
      y: 0,
      clipPath: "none",
      filter: "none",
    });
    if (name) {
      gsap.set(name, {
        letterSpacing: `${(0.12 * (1 - enter) - 0.04).toFixed(3)}em`,
      });
    }
    if (line) gsap.set(line, { y: 16 * (1 - enter), autoAlpha: shown });
    return;
  }

  if (layout === "callout") {
    gsap.set(el, {
      x: 0,
      y: 0,
      clipPath: `inset(0 ${(1 - enter) * 100 + exit * 100}% 0 0)`,
      filter: "none",
    });
    if (name) gsap.set(name, { letterSpacing: "-0.03em" });
    if (line) gsap.set(line, { y: 12 * (1 - enter), autoAlpha: shown });
    return;
  }

  if (layout === "result") {
    gsap.set(el, {
      x: 28 * (1 - enter) + exit * 18,
      y: 10 * (1 - enter),
      clipPath: "none",
      filter: "none",
    });
    if (name) gsap.set(name, { letterSpacing: `${(0.08 * (1 - enter) - 0.04).toFixed(3)}em` });
    if (line) gsap.set(line, { y: 10 * (1 - enter), autoAlpha: shown });
    return;
  }

  gsap.set(el, {
    x: 0,
    y: 36 * (1 - enter),
    clipPath: "none",
    filter: "none",
  });
  if (extra) gsap.set(extra, { autoAlpha: shown });
}

function VideoTag({
  videoRef,
  src,
  poster,
  className,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  src: string;
  poster: string;
  className: string;
}) {
  return (
    <video
      ref={videoRef}
      className={className}
      muted
      playsInline
      preload="auto"
      poster={poster}
      disablePictureInPicture
      controls={false}
      tabIndex={-1}
      aria-hidden
      {...{ "webkit-playsinline": "true" }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

export function MaxiconHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLElement>(null);
  const bayRef = useRef<HTMLVideoElement>(null);
  const ventRef = useRef<HTMLVideoElement>(null);
  const { reduced } = useMotionReady();
  const [reelReady, setReelReady] = useState(false);
  const [reelFailed, setReelFailed] = useState(false);

  useEffect(() => {
    const videos = [bayRef.current, ventRef.current].filter(
      (v): v is HTMLVideoElement => Boolean(v),
    );
    if (!videos.length) return;

    let cancelled = false;
    let started = false;
    let readyCount = 0;

    const tryStart = () => {
      if (started) return;
      if (videos.some((v) => !Number.isFinite(v.duration) || v.duration <= 0)) return;
      started = true;
      void (async () => {
        await Promise.all(videos.map((v) => unlockSeek(v, 0)));
        const pin = pinRef.current;
        const bay = bayRef.current;
        const vent = ventRef.current;
        const progress = pin ? pinProgress(pin) : 0;
        if (bay && Number.isFinite(bay.duration) && bay.duration > 0) {
          seekVideo(bay, bayPlayhead(progress, bay.duration));
        }
        if (vent && Number.isFinite(vent.duration) && vent.duration > 0) {
          const mapped = ventPlayhead(progress, vent.duration);
          // Vent is still clipped away at the head — decode the wipe-in
          // frame so the second clip is not cold when the cut starts.
          seekVideo(
            vent,
            mapped > 0.04 ? mapped : ventPlayhead(WIPE_START, vent.duration),
          );
        }
        if (!cancelled) setReelReady(true);
      })();
    };

    const onMeta = (video: HTMLVideoElement) => () => {
      if (Number.isFinite(video.duration) && video.duration > 0) readyCount += 1;
      if (readyCount >= videos.length || videos.every((v) => v.readyState >= 1)) {
        tryStart();
      }
    };

    const onError = () => setReelFailed(true);

    videos.forEach((video) => {
      if (video.readyState >= 1) onMeta(video)();
      video.addEventListener("loadedmetadata", onMeta(video));
      video.addEventListener("error", onError);
    });

    return () => {
      cancelled = true;
      videos.forEach((video) => {
        video.removeEventListener("loadedmetadata", onMeta(video));
      });
    };
  }, []);

  useEffect(() => {
    const pin = pinRef.current;
    const bay = bayRef.current;
    const vent = ventRef.current;
    if (!pin || !bay || !vent || reduced || reelFailed || !reelReady) return;

    let used = false;
    let confirmed = false;

    const retryIfStuck = () => {
      if (used || confirmed) return;
      const progress = pinProgress(pin);
      const active = progress < WIPE_END ? bay : vent;
      if (!Number.isFinite(active.duration) || active.duration <= 0) return;
      const expected =
        active === bay
          ? bayPlayhead(progress, active.duration)
          : ventPlayhead(progress, active.duration);
      if (expected <= 0.12) return;
      if (Math.abs(active.currentTime - expected) <= 0.25) {
        confirmed = true;
        return;
      }
      used = true;
      void (async () => {
        const now = pinProgress(pin);
        await unlockSeek(bay, bayPlayhead(now, bay.duration || 0));
        await unlockSeek(vent, ventPlayhead(now, vent.duration || 0));
      })();
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
      const bay = bayRef.current;
      const vent = ventRef.current;
      if (!root || !pin || !bay || !vent || reduced || reelFailed) return;

      bay.pause();
      vent.pause();
      bay.muted = true;
      vent.muted = true;

      const cue = pin.querySelector<HTMLElement>(".maxicon-reel-cue");
      const mark = pin.querySelector<HTMLElement>(".maxicon-reel-mark");
      const beats = pin.querySelectorAll<HTMLElement>("[data-beat]");

      const apply = (progress: number) => {
        if (Number.isFinite(bay.duration) && bay.duration > 0) {
          seekVideo(bay, bayPlayhead(progress, bay.duration));
        }
        if (Number.isFinite(vent.duration) && vent.duration > 0) {
          seekVideo(vent, ventPlayhead(progress, vent.duration));
        }

        const wipe = remap(progress, WIPE_START, WIPE_END);
        gsap.set(vent, {
          autoAlpha: wipe > 0.02 ? 1 : 0,
          clipPath: `inset(0 ${((1 - wipe) * 100).toFixed(2)}% 0 0)`,
          scale: 1.05 - 0.05 * wipe,
          transformOrigin: "70% 35%",
          force3D: true,
        });
        gsap.set(bay, {
          // After the wipe, drop the bay so a parked last frame cannot flash.
          autoAlpha: wipe >= 0.995 ? 0 : 1,
          scale: 1 + 0.04 * wipe,
          transformOrigin: "40% 50%",
          force3D: true,
        });
        bay.style.objectPosition = `${42 + progress * 8}% ${38 + progress * 6}%`;
        vent.style.objectPosition = `${50 + wipe * 10}% ${40 - wipe * 8}%`;

        beats.forEach((el) => {
          const spec = BEATS.find((b) => b.id === el.dataset.beat);
          if (!spec) return;
          applyBeat(
            el,
            beatLocal(progress, spec.start, spec.end),
            spec.hold,
            spec.start === 0,
          );
        });

        if (mark) {
          const next = markAt(progress);
          gsap.set(mark, {
            left: `${next.x}%`,
            top: `${next.y}%`,
            autoAlpha: next.hide ? 0 : 1,
          });
        }

        if (cue) {
          const cueOut = gsap.utils.clamp(0, 1, progress / 0.08);
          gsap.set(cue, { autoAlpha: 1 - cueOut });
        }
      };

      const bindPin = (scrub: boolean | number) => {
        const st = ScrollTrigger.create({
          trigger: pin,
          start: "top top",
          end: "bottom bottom",
          scrub,
          invalidateOnRefresh: true,
          onUpdate: (self) => apply(self.progress),
          onRefresh: (self) => apply(self.progress),
        });
        apply(st.progress);
      };

      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => bindPin(true));
      mm.add("(max-width: 899px)", () => bindPin(0.2));

      if (reelReady) ScrollTrigger.refresh();

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("resize", refresh);
      window.visualViewport?.addEventListener("resize", refresh);

      return () => {
        mm.revert();
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
          aria-label="Bay work, then cold air. Scroll to move through the film."
        >
          <div className="maxicon-reel-sticky">
            {staticCopy ? (
              <Image
                src={
                  reelFailed
                    ? "/demos/maxicon-car-aircon/maxicon-bay.jpg"
                    : BAY_POSTER
                }
                alt=""
                fill
                className="maxicon-reel-fallback"
                sizes="100vw"
                preload
              />
            ) : (
              <div className="maxicon-reel-stage">
                <VideoTag
                  videoRef={bayRef}
                  src={BAY_SRC}
                  poster={BAY_POSTER}
                  className="maxicon-reel maxicon-reel--bay"
                />
                <VideoTag
                  videoRef={ventRef}
                  src={VENT_SRC}
                  poster={VENT_POSTER}
                  className="maxicon-reel maxicon-reel--vent"
                />
              </div>
            )}

            <div className="maxicon-reel-veil" aria-hidden />
            {staticCopy ? null : (
              <div className="maxicon-reel-mark" aria-hidden>
                <span className="maxicon-reel-mark-dot" />
                <span className="maxicon-reel-mark-arm" />
              </div>
            )}

            {staticCopy ? (
              <div className="maxicon-reel-copy maxicon-reel-copy--static">
                <p className="maxicon-reel-kicker">{maxicon.offerKicker}</p>
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
              </div>
            ) : (
              <>
                <p className="maxicon-reel-cue">Scroll</p>
                <div className="maxicon-reel-copy">
                  <div
                    className="maxicon-reel-beat"
                    data-beat="heat"
                    data-layout="hero"
                  >
                    <p className="maxicon-reel-kicker">
                      Car aircon specialist
                    </p>
                    <p className="maxicon-reel-name">Hina na sa traffic?</p>
                    <p className="maxicon-reel-line">
                      Weak A/C. That’s the heat.
                    </p>
                  </div>
                  <div
                    className="maxicon-reel-beat"
                    data-beat="bay"
                    data-layout="callout"
                  >
                    <p className="maxicon-reel-kicker">In the bay</p>
                    <p className="maxicon-reel-name">
                      Aircon repair & evaluation
                    </p>
                    <p className="maxicon-reel-line">
                      Parts + service in the bay.
                    </p>
                  </div>
                  <div
                    className="maxicon-reel-beat"
                    data-beat="cold"
                    data-layout="result"
                  >
                    <p className="maxicon-reel-kicker">After the work</p>
                    <p className="maxicon-reel-name">The product is cold.</p>
                    <p className="maxicon-reel-line">That’s the vent talking.</p>
                  </div>
                  <div
                    className="maxicon-reel-beat"
                    data-beat="cta"
                    data-layout="bar"
                  >
                    <div className="maxicon-reel-bar-copy">
                      <p className="maxicon-reel-kicker">
                        {maxicon.offerKicker}
                      </p>
                      <p className="maxicon-reel-name">Bring it in.</p>
                      <p className="maxicon-reel-line maxicon-reel-offer">
                        Parts · Repair · Cleaning
                      </p>
                    </div>
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
                        <span>{maxicon.addressShort}</span>
                        <span aria-hidden>·</span>
                        <span>{maxicon.hours}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section id="visit" className="maxicon-visit" aria-label="Visit">
          <p className="maxicon-visit-kicker">{maxicon.address}</p>
          <p className="maxicon-mono maxicon-hours">{maxicon.hours}</p>
          <p className="maxicon-lede">{maxicon.parts}</p>
          <p className="maxicon-lede">{maxicon.services}</p>
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
