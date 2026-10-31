"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Scrub lag (s) shared by every beat (Design r8 §2). */
const SCRUB = 0.6;
const MOBILE = "(max-width: 700px)";
const vw = (n: number) => (window.innerWidth * n) / 100;

/**
 * r8.0 home scroll beats (Design r8 spec §2, B3-B10; the hero B2 lives in
 * Story.tsx and there is no B1 load timeline, see Story's header). One
 * entrance per screen, transform and opacity only, every beat a scrubbed
 * top-level timeline. The markup is the landed state: from-states are set
 * here, in JS, so without JS everything is simply there.
 *
 * Reduced motion: no sweeps, no sticky frame (r8.css). Each screen's text
 * block fades in once, 200ms, opacity only.
 *
 * #visit is in the Shell footer, outside the home tree, so the beats query
 * from the page root (.cgr) and the gsap context (useGSAP) reverts them all.
 */
export function useHomeMotion(root: RefObject<HTMLElement | null>) {
  const { ready } = useMotionReady();

  useGSAP(
    () => {
      const el = root.current;
      const page = el?.closest<HTMLElement>(".cgr") ?? el;
      if (!ready || !page) return;
      const $ = (s: string, ctx: ParentNode = page) => ctx.querySelector<HTMLElement>(s);
      const $$ = (s: string, ctx: ParentNode = page) => Array.from(ctx.querySelectorAll<HTMLElement>(s));
      const mm = gsap.matchMedia();

      mm.add(
        { reduce: "(prefers-reduced-motion: reduce)", mob: MOBILE },
        (c) => {
          const { reduce, mob } = c.conditions as { reduce: boolean; mob: boolean };

          if (reduce) {
            const blocks = $$(
              ".r11-spread .r11-txt, .r11-acc .r11-txt, .r11-suits-row, .r11-rail-meta, .r11-quotes blockquote, .r11-visit .r11-act",
            );
            blocks.forEach((b) => {
              gsap.fromTo(
                b,
                { opacity: 0 },
                { opacity: 1, duration: 0.2, ease: "none", scrollTrigger: { trigger: b, start: "top 92%", once: true } },
              );
            });
            return;
          }

          /* B3-B5 spreads: the photo rises and opens, the script word crosses, then line + CTA. */
          const spread = (s: HTMLElement | null, from: gsap.TweenVars) => {
            if (!s) return;
            const ph = $(".r11-ph", s);
            const img = $(".r11-ph img", s);
            const sc = $(".r11-script", s);
            const bits = $$(".r11-kick, h2, .r11-btn", s);
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger: s, start: "top bottom", end: mob ? "top 10%" : "top 25%", scrub: SCRUB },
            });
            if (ph) {
              tl.fromTo(ph, { y: 140, scale: 0.84 }, { y: 0, scale: 1, duration: 1, ease: "power2.out" }, 0);
              tl.fromTo(ph, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
            }
            if (img) tl.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 1, ease: "power2.out" }, 0);
            if (sc) tl.fromTo(sc, from, { x: 0, scale: 1, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.15);
            if (bits.length)
              tl.fromTo(bits, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.12, ease: "power2.out" }, 0.55);
          };
          spread($("#gowns"), { x: () => vw(30), opacity: 0 });
          spread($("#bridal"), { x: () => -vw(30), opacity: 0 });
          spread($("#filipiniana"), { scale: 1.9, opacity: 0, transformOrigin: "0% 60%" });

          /* B6 accessories: the tiaras pop, "Crowns" rises. */
          const acc = $("#accessories");
          if (acc) {
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger: acc, start: "top bottom", end: "top 30%", scrub: SCRUB },
            });
            tl.fromTo($$(".r11-ph", acc), { scale: 0.55, rotation: -4, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" }, 0)
              .fromTo($$(".r11-script", acc), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.2)
              .fromTo($$("h2, .r11-btn", acc), { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.1, ease: "power2.out" }, 0.55);
          }

          /* B7 suits (type only, sticky frame): the giant words sweep in from the right, then line + CTA. */
          const suits = $("#suits");
          if (suits) {
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger: suits, start: "top 60%", end: "bottom bottom", scrub: SCRUB },
            });
            tl.fromTo($$(".r11-suits-big", suits), { x: () => vw(mob ? 70 : 60), opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0)
              .fromTo($$(".r11-kick", suits), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.3)
              .fromTo($$(".r11-suits-row > *", suits), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.1, ease: "power2.out" }, 0.5)
              .to({}, { duration: 0.2 });
          }

          /* B8 rail: the side cards fan out from behind the centre card. The
             centre card replays its own CSS fade on every change, so the beat
             moves the card (transform) and fades its photo (opacity). */
          const rail = $("#rail");
          if (rail) {
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger: rail, start: "top 80%", end: mob ? "top 0%" : "top 5%", scrub: SCRUB },
            });
            tl.fromTo($$(".r11-rail-head .r11-script", rail), { scale: 1.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" }, 0)
              .fromTo($$(".r11-card.c", rail), { y: 120, scale: 0.88 }, { y: 0, scale: 1, duration: 0.6, ease: "power2.out" }, 0.1)
              .fromTo($$(".r11-card.c img", rail), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.1)
              .fromTo($$(".r11-card.l", rail), { xPercent: 110, rotation: -8, opacity: 0 }, { xPercent: 0, rotation: 0, opacity: 0.45, duration: 0.5, ease: "power2.out" }, 0.4)
              .fromTo($$(".r11-card.r", rail), { xPercent: -110, rotation: 8, opacity: 0 }, { xPercent: 0, rotation: 0, opacity: 0.45, duration: 0.5, ease: "power2.out" }, 0.4)
              .fromTo($$(".r11-rail-meta", rail), { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, 0.7);
          }

          /* B9 reviews: the shown quote rises line by line out of its own line box. */
          const rev = $("#reviews");
          if (rev) {
            const fig = $('figure[data-on="true"]', rev) ?? $("figure", rev);
            const words = fig ? $$(".r11-w > span", fig) : [];
            const lines: HTMLElement[][] = [];
            let top = Number.NaN;
            words.forEach((w) => {
              const t = (w.parentElement as HTMLElement).offsetTop;
              if (t !== top) {
                top = t;
                lines.push([]);
              }
              lines[lines.length - 1].push(w);
            });
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger: rev, start: "top 85%", end: "top 15%", scrub: SCRUB },
            });
            tl.fromTo($$(":scope > .r11-script", rev), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }, 0);
            lines.forEach((ln, k) => {
              tl.fromTo(ln, { yPercent: 105 }, { yPercent: 0, duration: 0.35, ease: "power3.out" }, 0.2 + k * 0.12);
            });
            const after = [...(fig ? $$("figcaption", fig) : []), ...$$(":scope > .r11-ctrl, :scope > .r11-link", rev)];
            tl.fromTo(after, { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0.05 }, Math.max(0.7, 0.2 + lines.length * 0.12));
          }

          /* B10 visit: "Visit" slides in, the wordmark rises out of the floor. */
          const visit = $("#visit");
          if (visit) {
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger: visit, start: "top 85%", end: "bottom bottom", scrub: SCRUB },
            });
            tl.fromTo($$(".r11-script", visit), { x: () => -vw(20), opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "power3.out" }, 0)
              .fromTo($$(".r11-addr, .r11-act", visit), { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.1, ease: "power2.out" }, 0.15)
              .fromTo($$(".r11-bigwm > span", visit), { yPercent: 100 }, { yPercent: 0, duration: 0.4, ease: "power3.out" }, 0.6);
          }
        },
      );

      // Lazy photos change section heights as they land: re-measure once each loads.
      const imgs = Array.from(page.querySelectorAll<HTMLImageElement>(".cgr-home img")).filter((i) => !i.complete);
      const refresh = () => ScrollTrigger.refresh();
      imgs.forEach((i) => i.addEventListener("load", refresh, { once: true }));
      ScrollTrigger.refresh();
      return () => {
        imgs.forEach((i) => i.removeEventListener("load", refresh));
        mm.revert();
      };
    },
    { dependencies: [ready], scope: root, revertOnUpdate: true },
  );
}
