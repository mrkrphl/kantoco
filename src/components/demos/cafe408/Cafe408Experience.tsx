"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { waitForOpenerAutoplay } from "@/lib/motion";
import {
  CAFE408,
  CAFE408_ASSET,
  CAFE408_CAPS,
  CAFE408_COUNTER,
} from "@/lib/cafe408";

gsap.registerPlugin(ScrollTrigger);

const PLATE_SIZES =
  "(min-width: 1312px) 1120px, calc(100vw - 2 * clamp(24px, 6vw, 96px))";

function Buttons() {
  return (
    <>
      <a
        className="c408-btn c408-btn-primary"
        href={CAFE408.messenger}
        target="_blank"
        rel="noopener"
      >
        Message on Facebook
      </a>
      <a
        className="c408-btn c408-btn-secondary"
        href={CAFE408.directions}
        target="_blank"
        rel="noopener"
      >
        Get directions
      </a>
    </>
  );
}

function CounterRow({
  item,
}: {
  item: (typeof CAFE408_COUNTER)[number];
}) {
  return (
    <div className="row" data-counter-row={item.n}>
      <span className="row-n">{item.n}</span>
      <p className="row-name">{item.name}</p>
      <p className="row-desc">{item.descriptor}</p>
    </div>
  );
}

function Picture({
  name,
  width,
  height,
  alt,
  sizes,
  eager,
}: {
  name: string;
  width: number;
  height: number;
  alt: string;
  sizes?: string;
  eager?: boolean;
}) {
  const base = `${CAFE408_ASSET}/${name}`;
  return (
    <picture>
      <source type="image/webp" srcSet={`${base}.webp`} />
      <img
        src={`${base}.jpg`}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : undefined}
      />
    </picture>
  );
}

export function Cafe408Experience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.documentElement.setAttribute("data-c408-live", "");
    const animate = document.documentElement.classList.contains("js-anim");
    let cancelled = false;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const frames = Array.from(
          root.querySelectorAll<HTMLElement>("[data-counter-stack] picture"),
        );
        const imgs = frames
          .map((frame) => frame.querySelector("img"))
          .filter((img): img is HTMLImageElement => Boolean(img));
        const cap = root.querySelector<HTMLElement>("[data-counter-cap]");
        const rows = Array.from(
          root.querySelectorAll<HTMLElement>(
            ".counter-desktop [data-counter-row]",
          ),
        );
        if (!frames.length || !imgs.length || !cap || !rows.length) return;

        let tl: gsap.core.Timeline | undefined;

        let current = 0;

        const reveal = (i: number) => {
          imgs.forEach((img, k) => {
            if (k === i) img.removeAttribute("aria-hidden");
            else img.setAttribute("aria-hidden", "true");
          });
        };

        reveal(0);
        cap.textContent = CAFE408_CAPS[0];

        const show = (i: number) => {
          if (i === current) return;
          current = i;
          reveal(i);
          if (!animate) {
            gsap.set(frames, {
              opacity: (k: number) => (k === i ? 1 : 0),
            });
            gsap.set(imgs, { scale: 1 });
            cap.textContent = CAFE408_CAPS[i];
            gsap.set(cap, { opacity: 1 });
            return;
          }

          tl?.kill();
          tl = gsap
            .timeline({ defaults: { ease: "power2.out" } })
            .to(
              frames,
              { opacity: (k: number) => (k === i ? 1 : 0), duration: 0.6 },
              0,
            )
            .fromTo(imgs[i], { scale: 1.06 }, { scale: 1, duration: 1.2 }, 0)
            .to(cap, { opacity: 0, duration: 0.15, ease: "power1.in" }, 0)
            .call(
              () => {
                cap.textContent = CAFE408_CAPS[i];
              },
              undefined,
              0.3,
            )
            .to(cap, { opacity: 1, duration: 0.2 }, 0.3);
        };

        const triggers = rows.map((row, n) =>
          ScrollTrigger.create({
            trigger: row,
            start: "top 55%",
            onEnter: () => {
              show(n);
              if (n === 0) {
                imgs.slice(1).forEach((img) => {
                  void img.decode?.()?.catch(() => undefined);
                });
              }
            },
            onLeaveBack: () => show(Math.max(0, n - 1)),
          }),
        );

        let initial = 0;
        rows.forEach((row, n) => {
          if (row.getBoundingClientRect().top < window.innerHeight * 0.55) {
            initial = n;
          }
        });
        if (initial !== 0) show(initial);

        return () => {
          tl?.kill();
          triggers.forEach((t) => t.kill());
        };
      });

      if (!animate) return;

      const startPour = () => {
        if (cancelled) return;
        ctx.add(() => {
          const pour = gsap.timeline();
          pour.fromTo(
            root.querySelector(".name-fill"),
            { clipPath: "inset(100% 0 0 0)" },
            { clipPath: "inset(0% 0 0 0)", duration: 1.1, ease: "power2.inOut" },
            0,
          );
          pour.fromTo(
            [
              root.querySelector(".opener-eyebrow"),
              root.querySelector(".opener-tagline"),
            ],
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
            0.7,
          );
          pour.fromTo(
            root.querySelectorAll(".opener-btns a"),
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" },
            1.1,
          );
          pour.fromTo(
            root.querySelector(".plate-frame"),
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
            1.3,
          );
        });
      };

      void waitForOpenerAutoplay(120).then(startPour);

      const plate = root.querySelector(".plate");
      const plateImgs = root.querySelectorAll(".plate-frame img");
      if (plate && plateImgs.length) {
        gsap.fromTo(
          plateImgs,
          { scale: 1.06 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: plate,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }

      root.querySelectorAll(".heading-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          },
        );
      });

      root.querySelectorAll(".row").forEach((row) => {
        gsap.fromTo(
          row,
          { "--line": 0 },
          {
            "--line": 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: row, start: "top 80%" },
          },
        );
      });

      const visitFrame = root.querySelector(".visit-frame");
      const visitImg = visitFrame?.querySelector("img");
      if (visitFrame && visitImg) {
        gsap.fromTo(
          visitImg,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: "none",
            scrollTrigger: { trigger: visitFrame, scrub: true },
          },
        );
      }

      mm.add("(max-width: 1023px)", () => {
        const shots = Array.from(
          root.querySelectorAll<HTMLElement>(".counter-mobile .mob-frame img"),
        );
        shots.forEach((img) => {
          gsap.fromTo(
            img,
            { scale: 1.06 },
            {
              scale: 1,
              duration: 1.2,
              ease: "power2.out",
              scrollTrigger: { trigger: img, start: "top 85%" },
            },
          );
        });
      });
    }, root);

    return () => {
      cancelled = true;
      document.documentElement.removeAttribute("data-c408-live");
      ctx.revert();
    };
  }, []);

  return (
    <div className="c408" ref={rootRef}>
      <p className="c408-bar">
        <span className="c408-bar-inner c408-wrap">
          <span className="c408-bar-desk">
            SAMPLE | NOT LIVE · A KantoCo sample for Cafe 408. Not the cafe&apos;s
            official site.
          </span>
          <span className="c408-bar-mob">SAMPLE | NOT LIVE · KantoCo sample</span>
        </span>
      </p>

      <main>
        <section className="c408-wrap opener">
          <p className="eyebrow opener-eyebrow">
            <span className="eyebrow-desk">
              CAFE FOUR O&apos;EIGHT · BF HOMES, PARAÑAQUE
            </span>
            <span className="eyebrow-mob">CAFE FOUR O&apos;EIGHT · BF HOMES</span>
          </p>
          <h1 className="name" aria-label="Cafe 408">
            <span className="name-ghost" aria-hidden="true">
              cafe 408
            </span>
            <span className="name-fill" aria-hidden="true">
              cafe 408
            </span>
          </h1>
          <div className="opener-row">
            <p className="opener-tagline">
              Coffee, matcha and rice plates at Chloe Center, Aguirre Avenue.
            </p>
            <div className="opener-btns">
              <Buttons />
            </div>
          </div>
        </section>

        <section className="c408-wrap plate-sec">
          <figure className="plate">
            <div className="plate-frame">
              <picture>
                <source
                  media="(max-width: 767px)"
                  type="image/webp"
                  srcSet={`${CAFE408_ASSET}/plate-mobile-4x5.webp`}
                  width={921}
                  height={1151}
                />
                <source
                  media="(max-width: 767px)"
                  type="image/jpeg"
                  srcSet={`${CAFE408_ASSET}/plate-mobile-4x5.jpg`}
                  width={921}
                  height={1151}
                />
                <source
                  type="image/webp"
                  srcSet={`${CAFE408_ASSET}/plate-16x9-1x.webp 1120w, ${CAFE408_ASSET}/plate-16x9.webp 2046w`}
                  sizes={PLATE_SIZES}
                />
                <img
                  src={`${CAFE408_ASSET}/plate-16x9-1x.jpg`}
                  srcSet={`${CAFE408_ASSET}/plate-16x9-1x.jpg 1120w, ${CAFE408_ASSET}/plate-16x9.jpg 2046w`}
                  sizes={PLATE_SIZES}
                  width={2046}
                  height={1151}
                  alt="A white Cafe 408 takeaway cup with a black lid on a plain grey table, in soft side light."
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </div>
            <figcaption className="cap">Their cup, from their Facebook.</figcaption>
          </figure>
        </section>

        <section className="c408-wrap intro">
          <div className="intro-grid">
            <p className="intro-line heading-reveal">
              Cafe 408 has two branches, one in Quezon City and one here in BF
              Homes. This page is for the BF Homes one.
            </p>
          </div>
        </section>

        <section className="c408-wrap counter">
          <p className="eyebrow heading-reveal">ON THE COUNTER</p>
          <div className="counter-h-grid">
            <h2 className="section-h counter-h heading-reveal">
              Coffee, matcha, and a plate to stay for.
            </h2>
          </div>

          <div className="counter-desktop">
            <div className="counter-rows">
              {CAFE408_COUNTER.map((item) => (
                <CounterRow key={item.n} item={item} />
              ))}
              <p className="footnote">
                Names from their Facebook posts. Ask at the counter for
                today&apos;s menu and prices.
              </p>
            </div>
            <figure className="counter-aside">
              <div className="counter-frame">
                <div className="counter-stack" data-counter-stack>
                  {CAFE408_COUNTER.map((item, i) => (
                    <picture key={item.file}>
                      <source
                        type="image/webp"
                        srcSet={`${CAFE408_ASSET}/${item.file}.webp`}
                      />
                      <img
                        src={`${CAFE408_ASSET}/${item.file}.jpg`}
                        alt={item.alt}
                        width={896}
                        height={896}
                        loading="lazy"
                        decoding="async"
                        aria-hidden={i === 0 ? undefined : true}
                      />
                    </picture>
                  ))}
                </div>
              </div>
              <figcaption className="cap counter-cap" data-counter-cap>
                {CAFE408_CAPS[0]}
              </figcaption>
            </figure>
          </div>

          <div className="counter-mobile">
            {CAFE408_COUNTER.map((item) => (
              <article className="counter-group" key={item.n}>
                <figure className="mob-shot">
                  <div className="mob-frame">
                    <Picture
                      name={item.file}
                      width={896}
                      height={896}
                      alt={item.alt}
                    />
                  </div>
                  <figcaption className="cap">{item.caption}</figcaption>
                </figure>
                <CounterRow item={item} />
              </article>
            ))}
            <p className="footnote">
              Names from their Facebook posts. Ask at the counter for
              today&apos;s menu and prices.
            </p>
          </div>
        </section>
      </main>

      <section className="visit">
        <div className="c408-wrap">
          <p className="eyebrow heading-reveal">VISIT</p>
          <div className="visit-h-grid">
            <h2 className="visit-h heading-reveal">
              Open until 1&nbsp;am, Wednesday to Sunday.
            </h2>
          </div>
          <div className="visit-btns">
            <div className="visit-btns-inner">
              <Buttons />
            </div>
          </div>
          <div className="visit-split">
            <figure className="visit-photo">
              <div className="visit-frame">
                <Picture
                  name="visit-shadow-2x1"
                  width={1080}
                  height={540}
                  alt="Leaf shadows falling across a cracked concrete floor in afternoon sun."
                />
              </div>
              <figcaption className="cap">
                Leaf shadows on their concrete, from their Facebook.
              </figcaption>
            </figure>
            <div className="visit-info">
              <div className="visit-block">
                <p className="eyebrow">ADDRESS</p>
                <div className="visit-lines">
                  <p>Unit 1C, Chloe Center</p>
                  <p>162 Aguirre Ave., BF&nbsp;Homes</p>
                  <p>Parañaque</p>
                </div>
              </div>
              <div className="visit-block">
                <p className="eyebrow">HOURS</p>
                <div className="hours-row">
                  <span className="hours-day">Mon–Tue</span>
                  <span>10&nbsp;am–10&nbsp;pm</span>
                </div>
                <div className="hours-row">
                  <span className="hours-day">Wed–Sun</span>
                  <span>9:30&nbsp;am–1&nbsp;am</span>
                </div>
                <p className="hours-note">From their Google Maps listing.</p>
              </div>
              <p className="qc-line">
                Also at The Rock Lifestyle Hub, Quezon City.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="c408-foot">
        <div className="c408-wrap foot-grid">
          <p className="foot-copy">
            A KantoCo sample for Cafe 408. Not live, and not the cafe&apos;s
            official site.
          </p>
          <p className="foot-copy">
            Photos: Cafe 408 (Facebook, Google Maps) and Jehan Marie Yucot
            (Google Maps), used for this private sample only. Hours: Google
            Maps.
          </p>
          <p className="foot-copy">
            <a href={CAFE408.facebook} target="_blank" rel="noopener">
              facebook.com/cafe408
            </a>
            {" · "}
            <a href={CAFE408.instagram} target="_blank" rel="noopener">
              instagram.com/cafe408_
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
