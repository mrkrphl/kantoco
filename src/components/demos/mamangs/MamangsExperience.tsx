"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DEMO_BADGE } from "@/lib/demos";
import {
  MAMANGS_HOURS,
  MAMANGS_MEALS,
  MAMANGS_MENU,
  mamangs,
} from "@/lib/mamangs";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __mpStarted?: boolean;
  }
}

const PIE_SIZES = "(min-width:1024px) min(640px, 57vw), calc(100vw - 48px)";

function waitForStart() {
  return Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, 1000);
    }),
  ]).then(
    () =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, 150);
      }),
  );
}

function Picture({
  name,
  width,
  height,
  alt,
  sizes,
  eager,
  className,
  srcSet1x,
}: {
  name: string;
  width: number;
  height: number;
  alt: string;
  sizes?: string;
  eager?: boolean;
  className?: string;
  srcSet1x?: { name: string; w: number };
}) {
  const base = `${mamangs.asset}/${name}`;
  const webpSet = srcSet1x
    ? `${mamangs.asset}/${srcSet1x.name}.webp ${srcSet1x.w}w, ${base}.webp ${width}w`
    : `${base}.webp`;
  const jpgSet = srcSet1x
    ? `${mamangs.asset}/${srcSet1x.name}.jpg ${srcSet1x.w}w, ${base}.jpg ${width}w`
    : `${base}.jpg`;

  return (
    <picture>
      <source type="image/webp" srcSet={webpSet} sizes={sizes} />
      <source type="image/jpeg" srcSet={jpgSet} sizes={sizes} />
      <img
        className={className}
        src={`${base}.jpg`}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
      />
    </picture>
  );
}

function Buttons() {
  return (
    <>
      <a className="mp-btn mp-btn--fill" href={mamangs.phoneHref}>
        {mamangs.callLabel}
      </a>
      <a
        className="mp-btn mp-btn--line"
        href={mamangs.messenger}
        target="_blank"
        rel="noopener noreferrer"
      >
        {mamangs.messageLabel}
      </a>
    </>
  );
}

function playOpener(root: HTMLElement) {
  const letters = gsap.utils.toArray<HTMLElement>(".mp-name .ch", root);
  const side = gsap.utils.toArray<HTMLElement>(".mp-opener-side > *", root);
  const buttons = gsap.utils.toArray<HTMLElement>(".mp-opener .mp-btn", root);
  const eyebrow = root.querySelector<HTMLElement>(".mp-opener-eyebrow");
  const pie = root.querySelector<HTMLElement>(".pie");

  gsap.set(letters, { yPercent: 55, opacity: 0 });
  if (eyebrow) gsap.set(eyebrow, { opacity: 0 });
  gsap.set(side, { y: 16, opacity: 0 });
  gsap.set(buttons, { y: 12, opacity: 0 });
  if (pie) gsap.set(pie, { opacity: 0, scale: 0.96, rotate: -40 });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(
    letters,
    { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.035 },
    0,
  );
  if (eyebrow) tl.to(eyebrow, { opacity: 1, duration: 0.5 }, 0.15);
  tl.to(side, { y: 0, opacity: 1, duration: 0.55, stagger: 0.08 }, 0.6);
  tl.to(buttons, { y: 0, opacity: 1, duration: 0.45, stagger: 0.08 }, 1);
  if (pie) {
    tl.to(
      pie,
      { opacity: 1, scale: 1, rotate: -14, duration: 1 },
      0.8,
    );
  }
}

function setupScroll(root: HTMLElement) {
  const oven = root.querySelector<HTMLElement>(".oven");
  const pie = root.querySelector<HTMLElement>(".pie");
  const pieImg = root.querySelector<HTMLElement>(".pie-img");
  if (oven && pie && pieImg) {
    const trigger = gsap.fromTo(
      pieImg,
      { rotate: 0 },
      {
        rotate: 30,
        ease: "none",
        scrollTrigger: {
          trigger: oven,
          start: "clamp(top bottom)",
          end: "bottom top",
          scrub: 0.6,
          onToggle: (self) => {
            const value = self.isActive ? "transform" : "auto";
            pie.style.willChange = value;
            pieImg.style.willChange = value;
          },
        },
      },
    );
    void trigger;
  }

  const ovenCopy = gsap.utils.toArray<HTMLElement>(
    ".mp-plate-copy > *",
    root,
  );
  if (ovenCopy.length) {
    gsap.fromTo(
      ovenCopy,
      { y: 16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root.querySelector(".mp-plate-copy"),
          start: "top 75%",
          once: true,
        },
      },
    );
  }

  const lasFrame = root.querySelector<HTMLElement>(".las-frame");
  const lasImg = lasFrame?.querySelector("img");
  if (lasFrame && lasImg) {
    gsap.fromTo(
      lasFrame,
      { clipPath: "inset(10% 0 0 0)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: lasFrame, start: "top 80%", once: true },
      },
    );
    gsap.fromTo(
      lasImg,
      { scale: 1.06 },
      {
        scale: 1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: lasFrame, start: "top 80%", once: true },
      },
    );
  }

  const pepImg = root.querySelector<HTMLElement>(".pep-frame img");
  if (pepImg) {
    gsap.fromTo(
      pepImg,
      { scale: 1 },
      {
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: root.querySelector(".pepperoni"),
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  }

  const menu = root.querySelector(".mp-menu");
  const menuRows = gsap.utils.toArray<HTMLElement>(".mp-menu-row", root);
  if (menu && menuRows.length) {
    gsap.fromTo(
      menuRows,
      { y: 12, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: menu, start: "top 85%", once: true },
      },
    );
    menuRows.forEach((row, i) => {
      const vars = { line: 0 };
      row.style.setProperty("--line", "0");
      gsap.to(vars, {
        line: 1,
        duration: 0.8,
        delay: i * 0.07,
        ease: "power3.out",
        onUpdate: () => row.style.setProperty("--line", String(vars.line)),
        scrollTrigger: { trigger: menu, start: "top 85%", once: true },
      });
    });
  }

  const mealsBox = root.querySelector(".mp-meals");
  const meals = gsap.utils.toArray<HTMLElement>(".mp-meal", root);
  if (mealsBox && meals.length) {
    meals.forEach((row, i) => {
      const vars = { line: 0 };
      row.style.setProperty("--line", "0");
      gsap.to(vars, {
        line: 1,
        duration: 0.8,
        delay: i * 0.07,
        ease: "power3.out",
        onUpdate: () => row.style.setProperty("--line", String(vars.line)),
        scrollTrigger: { trigger: mealsBox, start: "top 85%", once: true },
      });
    });
  }

  const groupImg = root.querySelector<HTMLElement>(".group-frame img");
  if (groupImg) {
    gsap.fromTo(
      groupImg,
      { yPercent: -6 },
      {
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.querySelector(".group-frame"),
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  }

  const storeImg = root.querySelector<HTMLElement>(".store-frame img");
  if (storeImg) {
    gsap.fromTo(
      storeImg,
      { scale: 1.05 },
      {
        scale: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root.querySelector(".store-frame"),
          start: "top 80%",
          once: true,
        },
      },
    );
  }

  const visitRise = gsap.utils.toArray<HTMLElement>(
    ".mp-visit-dial, .mp-visit-ctas .mp-btn",
    root,
  );
  if (visitRise.length) {
    gsap.fromTo(
      visitRise,
      { y: 12, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root.querySelector(".mp-visit-dial"),
          start: "top 85%",
          once: true,
        },
      },
    );
  }
}

export function MamangsExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const mm = gsap.matchMedia();
    let live = true;

    const start = () => {
      if (!live || !rootRef.current) return;
      const canAnimate = document.documentElement.classList.contains("js-anim");

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!canAnimate) return;
        try {
          playOpener(rootRef.current!);
          setupScroll(rootRef.current!);
        } catch {
          document.documentElement.classList.remove("js-anim");
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        document.documentElement.classList.remove("js-anim");
        const pie = rootRef.current?.querySelector<HTMLElement>(".pie");
        if (pie) gsap.set(pie, { rotate: -14 });
        rootRef.current
          ?.querySelectorAll<HTMLElement>(
            ".mp-menu-row, .mp-meal, .mp-hour",
          )
          .forEach((el) => el.style.setProperty("--line", "1"));
      });

      window.__mpStarted = true;
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    if (reduced) {
      document.documentElement.classList.remove("js-anim");
      start();
    } else {
      waitForStart().then(start);
    }

    return () => {
      live = false;
      mm.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="mp">
      <p className="mp-bar">
        <span className="mp-wrap mp-bar-inner">
          <span className="mp-bar-full">
            <strong className="mp-bar-mark">{DEMO_BADGE}</strong>
            <span className="mp-bar-note">
              A KantoCo sample, not Mamang&apos;s official site
            </span>
          </span>
          <span className="mp-bar-short">
            <strong className="mp-bar-mark">{DEMO_BADGE}</strong>
            {" · KantoCo sample"}
          </span>
        </span>
      </p>

      <section className="mp-opener" aria-label={mamangs.fullName}>
        <div className="mp-wrap mp-opener-grid">
          <p className="mp-eyebrow mp-opener-eyebrow">
            <span className="mp-eyebrow-a">AUTHENTIC BRICK-OVEN PIZZA</span>
            <span className="mp-eyebrow-dot"> · </span>
            <span className="mp-eyebrow-b">BF HOMES, PARAÑAQUE</span>
          </p>
          <h1 className="mp-h1" aria-label={mamangs.fullName}>
            <span className="mp-name" aria-hidden="true">
              {mamangs.name.split("").map((ch, i) => (
                <span className="ch" key={`${ch}-${i}`}>
                  {ch}
                </span>
              ))}
            </span>
          </h1>
          <div className="mp-opener-side">
            <p className="mp-side-title">{mamangs.sideTitle}</p>
            <p className="mp-tagline">{mamangs.tagline}</p>
            <p className="mp-address">{mamangs.addressLine}</p>
          </div>
          <div className="mp-ctas">
            <Buttons />
          </div>
        </div>
      </section>

      <section className="mp-plate" aria-label="From the brick oven">
        <div className="mp-wrap mp-plate-grid">
          <div className="mp-plate-align">
            <figure className="oven">
              <div className="pie">
                <Picture
                  name="plate-pizza-1x1"
                  width={1400}
                  height={1400}
                  alt="A whole pizza from above, with basil, anchovies, mozzarella and charred crust spots."
                  sizes={PIE_SIZES}
                  eager
                  className="pie-img"
                  srcSet1x={{ name: "plate-pizza-1x1-1x", w: 700 }}
                />
              </div>
            </figure>
            <p className="mp-cap oven-cap">
              Their pizza, fresh out of the oven · Liza Viray on Google Maps
            </p>
            <div className="mp-plate-copy">
              <p className="mp-eyebrow">FROM THE BRICK OVEN</p>
              <h2 className="mp-h-oven">Pizza that goes through a real brick oven.</h2>
              <p className="mp-body">
                Whole pies for a table of two or the whole barkada, plus
                family-sized ones in the group meals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mp-table" aria-label="On the table">
        <div className="mp-wrap">
          <p className="mp-eyebrow">ON THE TABLE</p>
          <h2 className="mp-h-table">Pizza first, then everything else.</h2>
          <div className="mp-table-grid">
            <figure className="lasagna">
              <div className="mp-frame las-frame">
                <Picture
                  name="table-lasagna-6x5"
                  width={1254}
                  height={1045}
                  alt="Brick-oven lasagna in a metal tray with garlic bread on the side."
                  sizes="(min-width:1024px) 640px, calc(100vw - 48px)"
                />
              </div>
              <figcaption className="mp-cap">
                Brick-oven lasagna with garlic bread · their Facebook
              </figcaption>
            </figure>
            <figure className="pepperoni">
              <div className="mp-frame pep-frame">
                <Picture
                  name="table-pepperoni-3x2"
                  width={1000}
                  height={667}
                  alt="A pepperoni pizza on a wooden table."
                  sizes="(min-width:1024px) 448px, calc(100vw - 48px)"
                />
              </div>
              <figcaption className="mp-cap">
                Pepperoni · their Facebook
              </figcaption>
              <p className="mp-body pep-body">
                The lasagna comes in the tray with garlic bread on the side.
                Pasta, Buffalo wings and steak plates fill out the rest of the
                menu.
              </p>
            </figure>
          </div>
          <div className="mp-menu">
            {MAMANGS_MENU.map((row) => (
              <div className="mp-menu-row" key={row.name}>
                <p className="mp-menu-name">{row.name}</p>
                <p className="mp-menu-desc">{row.desc}</p>
              </div>
            ))}
          </div>
          <p className="mp-note">
            From their own Facebook menu posts. Ask the shop for today&apos;s
            menu.
          </p>
        </div>
      </section>

      <section className="mp-group" aria-label="Group meals">
        <div className="mp-wrap mp-group-grid">
          <p className="mp-eyebrow">GROUP MEALS</p>
          <h2 className="mp-h-group">For the whole table.</h2>
          <figure className="mp-group-fig">
            <div className="mp-frame group-frame">
              <Picture
                name="group-spread-4x5"
                width={1152}
                height={1440}
                alt="A table of pizza, pasta and drinks at Mamang's."
                sizes="(min-width:1024px) 544px, calc(100vw - 48px)"
              />
            </div>
            <figcaption className="mp-cap">
              A full table at Mamang&apos;s · their Facebook
            </figcaption>
          </figure>
          <hr className="mp-group-rule" />
          <div className="mp-meals">
            {MAMANGS_MEALS.map((meal) => (
              <article className="mp-meal" key={meal.name}>
                <div className="mp-meal-top">
                  <h3 className="mp-meal-name">{meal.name}</h3>
                  <p className="mp-meal-price">{meal.price}</p>
                </div>
                <p className="mp-meal-serves">{meal.serves}</p>
                <p className="mp-meal-desc">{meal.desc}</p>
              </article>
            ))}
          </div>
          <p className="mp-note">
            Prices as posted on their Facebook page. Terms apply, so confirm
            with the shop.
          </p>
        </div>
      </section>

      <section className="mp-visit" aria-label="Visit">
        <div className="mp-wrap">
          <p className="mp-eyebrow">VISIT</p>
          <h2 className="mp-h-visit">Open every day on Aguirre.</h2>
          <div className="mp-visit-head">
            <p className="mp-eyebrow">CALL OR MESSAGE</p>
            <a className="mp-visit-dial" href={mamangs.phoneHref}>
              {mamangs.phoneNbsp}
            </a>
            <div className="mp-ctas mp-visit-ctas">
              <Buttons />
            </div>
          </div>
          <div className="mp-visit-block">
            <div className="mp-visit-align">
              <figure className="mp-store">
                <div className="mp-frame store-frame">
                  <Picture
                    name="visit-storefront-4x5"
                    width={1200}
                    height={1500}
                    alt="Mamang's Pizzeria storefront on Aguirre Avenue, with the brick-oven logo over the door."
                    sizes="(min-width:1024px) 448px, calc(100vw - 48px)"
                  />
                </div>
              </figure>
              <p className="mp-cap store-cap">
                Their storefront on Aguirre Ave · Vheneth Franche on Google Maps
              </p>
              <div className="mp-visit-info">
              <div>
                <p className="mp-eyebrow">ADDRESS</p>
                <p className="mp-visit-heading">{mamangs.addressVisit}</p>
                <p className="mp-visit-city">{mamangs.city}</p>
                <a
                  className="mp-map"
                  href={mamangs.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {mamangs.mapsLabel}
                </a>
              </div>
              <div className="mp-hours">
                <p className="mp-eyebrow">HOURS</p>
                {MAMANGS_HOURS.map((row) => (
                  <div className="mp-hour" key={row.days}>
                    <p className="mp-hour-days">{row.days}</p>
                    <p className="mp-hour-time">{row.time}</p>
                  </div>
                ))}
                <p className="mp-note">
                  Hours from Google Maps. Holiday and private-event closures go
                  up on their Facebook first.
                </p>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mp-foot">
        <div className="mp-wrap mp-foot-grid">
          <p className="mp-foot-name">{mamangs.fullName}</p>
          <div className="mp-foot-copy">
            <p>{mamangs.credit}</p>
            <p>{mamangs.sampleNote}</p>
            <p>
              <a
                className="mp-made"
                href={mamangs.kantocoMessenger}
                target="_blank"
                rel="noopener noreferrer"
              >
                {mamangs.madeBy}
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
