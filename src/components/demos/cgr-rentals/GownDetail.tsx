"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { CATEGORY_LABEL, CGR_ASSET, CGR_BASE, GOWNS, formatPhp, type Gown } from "@/lib/cgr-rentals";
import { isDateFree, useBookings, useToday } from "@/components/demos/cgr-rentals/bookings";
import { useMotionReady } from "@/components/motion/useMotionReady";

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "Fri 6 Nov" from an ISO date (fixed English, no locale drift). */
export function humanDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`;
}

/** "6 Nov" for the CTA. */
export function shortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MO[d.getMonth()]}`;
}

/** Plain name (r7 drops the italic-last treatment). Kept for older imports. */
export function ItalicLast({ text }: { text: string }) {
  return <>{text}</>;
}

/** The two display words: the first two words of the name, minus "gown". */
function displayWords(name: string): string[] {
  const w = name.replace(/\s+gown$/i, "").split(/\s+/).slice(0, 2);
  return w.map((x) => x.toUpperCase());
}

const CAL_HEAD = ["S", "M", "T", "W", "T", "F", "S"];
const CAL_CELLS = 42; // 6 rows always, so the grid never changes height (CLS 0)
const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** Organic photo edges (stamp §4 Dividers), normalised to objectBoundingBox. */
function PhotoClips({ id }: { id: string }) {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        {/* desktop 820x1040: M0 0 H700 C 790 120 840 300 800 470 C 760 640 860 820 820 1040 H0 Z */}
        <clipPath id={`${id}-d`} clipPathUnits="objectBoundingBox">
          <path d="M0 0 H0.854 C 0.963 0.115 1 0.288 0.976 0.452 C 0.927 0.615 1 0.788 1 1 H0 Z" />
        </clipPath>
        {/* phone 390x540: M0 0 H390 V470 C 300 540 160 500 0 540 Z */}
        <clipPath id={`${id}-p`} clipPathUnits="objectBoundingBox">
          <path d="M0 0 H1 V0.87 C 0.769 1 0.41 0.926 0 1 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function GownDetail({ gown }: { gown: Gown }) {
  const { reduced } = useMotionReady();
  const [active, setActive] = useState(0);
  // Today + localStorage are client-only: same-size placeholders on the server.
  const today = useToday();
  const bookings = useBookings();
  const ready = today !== null && bookings !== null;
  const [picked, setPicked] = useState<string | null>(null);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const img = gown.images[active] ?? gown.images[0];
  const words = displayWords(gown.name);
  const len = Math.max(...words.map((w) => w.length));
  const no = String(GOWNS.indexOf(gown) + 1).padStart(2, "0");

  const isFree = (d: string) =>
    ready && d >= (today ?? "") && isDateFree(gown.slug, d, gown.bookedDates, bookings ?? []);

  // Default pick: the first open date a week or more out.
  const defaultDate = useMemo(() => {
    if (!today || !bookings) return "";
    for (let i = 7; i < 120; i++) {
      const d = addDaysIso(today, i);
      if (isDateFree(gown.slug, d, gown.bookedDates, bookings)) return d;
    }
    return addDaysIso(today, 7);
  }, [today, bookings, gown.slug, gown.bookedDates]);
  const date = picked ?? defaultDate;
  const free = Boolean(date) && isFree(date);

  const base = date || today || "";
  const vy = view?.y ?? (base ? Number(base.slice(0, 4)) : 2026);
  const vm = view?.m ?? (base ? Number(base.slice(5, 7)) - 1 : 10);
  const first = new Date(vy, vm, 1).getDay();
  const days = new Date(vy, vm + 1, 0).getDate();
  const shift = (n: number) => {
    const d = new Date(vy, vm + n, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };
  const todayMonth = today ? Number(today.slice(0, 4)) * 12 + Number(today.slice(5, 7)) - 1 : 0;
  const canPrev = !today || vy * 12 + vm > todayMonth;

  const holdHref = free ? `${CGR_BASE}/reserve/${gown.slug}?date=${encodeURIComponent(date)}` : undefined;
  const sizes = gown.sizes.length > 1 ? `size ${gown.sizes[0]} to ${gown.sizes[gown.sizes.length - 1]}` : gown.sizes[0]?.toLowerCase();

  /* ---- lens (desktop cursor / phone press-and-hold) ---- */
  const panelRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const panel = panelRef.current;
    const lens = lensRef.current;
    const im = imgRef.current;
    if (!panel || !lens || !im || reduced) return;
    const R = () => lens.offsetWidth / 2;
    const cur = { x: 0, y: 0 };
    const tgt = { x: 0, y: 0 };
    let on = false;
    let touchOn = false;
    let raf = 0;
    let geo = { W: 0, H: 0, dw: 0, dh: 0, ox: 0, oy: 0 };
    const measure = () => {
      const W = panel.clientWidth;
      const H = panel.clientHeight;
      const iw = im.naturalWidth || Number(im.getAttribute("width")) || 1;
      const ih = im.naturalHeight || Number(im.getAttribute("height")) || 1;
      const s = Math.max(W / iw, H / ih);
      const dw = iw * s;
      const dh = ih * s;
      // object-position: 50% 20%
      geo = { W, H, dw, dh, ox: (W - dw) * 0.5, oy: (H - dh) * 0.2 };
      lens.style.backgroundSize = `${(dw * 2).toFixed(1)}px ${(dh * 2).toFixed(1)}px`;
    };
    const paint = () => {
      const r = R();
      // Lens sits above the finger on touch so the finger doesn't cover it.
      const lift = touchOn ? r + 40 : 0;
      lens.style.transform = `translate3d(${(cur.x - r).toFixed(1)}px, ${(cur.y - r - lift).toFixed(1)}px, 0)`;
      const u = (cur.x - geo.ox) / geo.dw;
      const v = (cur.y - lift - geo.oy) / geo.dh;
      // Magnify the point under the lens centre.
      const bx = -(u * geo.dw * 2 - r);
      const by = -(v * geo.dh * 2 - r);
      lens.style.backgroundPosition = `${bx.toFixed(1)}px ${by.toFixed(1)}px`;
    };
    const tick = () => {
      cur.x += (tgt.x - cur.x) * 0.18;
      cur.y += (tgt.y - cur.y) * 0.18;
      paint();
      raf = on || Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const show = (x: number, y: number) => {
      measure();
      tgt.x = cur.x = x;
      tgt.y = cur.y = y;
      on = true;
      paint();
      gsap.to(lens, { autoAlpha: 1, scale: 1, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const hide = () => {
      on = false;
      gsap.to(lens, { autoAlpha: 0, scale: 0.6, duration: 0.2, ease: "power2.in", overwrite: "auto" });
    };
    const local = (cx: number, cy: number) => {
      const b = panel.getBoundingClientRect();
      return { x: cx - b.left, y: cy - b.top };
    };
    gsap.set(lens, { autoAlpha: 0, scale: 0.6 });

    // Fine pointer: follow the cursor.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const p = local(e.clientX, e.clientY);
      if (!on) show(p.x, p.y);
      tgt.x = p.x;
      tgt.y = p.y;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || e.pointerType === "pen") hide();
    };

    // Touch: press and hold 250ms, then the lens follows the finger.
    let holdTimer = 0;
    let start = { x: 0, y: 0 };
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t || e.touches.length > 1) return;
      start = { x: t.clientX, y: t.clientY };
      window.clearTimeout(holdTimer);
      holdTimer = window.setTimeout(() => {
        touchOn = true;
        const p = local(start.x, start.y);
        show(p.x, p.y);
      }, 250);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      if (touchOn) {
        e.preventDefault();
        const p = local(t.clientX, t.clientY);
        tgt.x = p.x;
        tgt.y = p.y;
        if (!raf) raf = requestAnimationFrame(tick);
      } else if (Math.hypot(t.clientX - start.x, t.clientY - start.y) > 10) {
        window.clearTimeout(holdTimer);
      }
    };
    const onTouchEnd = () => {
      window.clearTimeout(holdTimer);
      if (touchOn) {
        touchOn = false;
        hide();
      }
    };
    const onCtx = (e: Event) => {
      if (touchOn) e.preventDefault();
    };
    const onResize = () => measure();

    panel.addEventListener("pointermove", onMove);
    panel.addEventListener("pointerleave", onLeave);
    panel.addEventListener("touchstart", onTouchStart, { passive: true });
    panel.addEventListener("touchmove", onTouchMove, { passive: false });
    panel.addEventListener("touchend", onTouchEnd);
    panel.addEventListener("touchcancel", onTouchEnd);
    panel.addEventListener("contextmenu", onCtx);
    window.addEventListener("resize", onResize);
    im.addEventListener("load", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(holdTimer);
      panel.removeEventListener("pointermove", onMove);
      panel.removeEventListener("pointerleave", onLeave);
      panel.removeEventListener("touchstart", onTouchStart);
      panel.removeEventListener("touchmove", onTouchMove);
      panel.removeEventListener("touchend", onTouchEnd);
      panel.removeEventListener("touchcancel", onTouchEnd);
      panel.removeEventListener("contextmenu", onCtx);
      window.removeEventListener("resize", onResize);
      im.removeEventListener("load", onResize);
      gsap.killTweensOf(lens);
    };
  }, [reduced, img.file]);

  const src = `${CGR_ASSET}/${img.file}.webp`;
  const nameStyle = { "--len": len } as React.CSSProperties;
  const ctaLabel = date ? shortDate(date) : "your date";

  return (
    <div className="cgr-dt cream grain" data-reduced={reduced ? "true" : "false"}>
      <PhotoClips id="cgr-dt-clip" />
      <h1 className="sr-only">{gown.name}</h1>

      {/* ink copy of the name, on the cream layer */}
      <p className="cgr-dt-name ext" style={nameStyle} aria-hidden="true">
        {words.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </p>

      <div ref={panelRef} className="cgr-dt-photo dark">
        <img
          ref={imgRef}
          className="cgr-dt-img"
          src={src}
          alt={img.alt}
          width={img.w}
          height={img.h}
          decoding="async"
          fetchPriority="high"
        />
        {/* cream copy of the name, clipped by the photo's organic edge */}
        <p className="cgr-dt-name cgr-dt-name-in ext" style={nameStyle} aria-hidden="true">
          {words.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </p>
        {reduced ? (
          <a className="cgr-dt-zoom mono" href={src} target="_blank" rel="noopener noreferrer">
            open full size
          </a>
        ) : (
          <div
            ref={lensRef}
            className="cgr-dt-lens"
            aria-hidden="true"
            style={{ backgroundImage: `url(${src})` }}
          >
            <span className="cgr-dt-lens-tag mono">
              <span className="lens-desk">2x, follows the cursor</span>
              <span className="lens-phone">press and hold</span>
            </span>
          </div>
        )}
      </div>

      {gown.images.length > 1 ? (
        <div className="cgr-dt-thumbs" role="group" aria-label="Photos">
          {gown.images.slice(0, 3).map((im, i) => (
            <button
              key={im.file + i}
              type="button"
              className="cgr-dt-thumb"
              aria-label={`Photo ${i + 1} of ${Math.min(3, gown.images.length)}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              <img src={`${CGR_ASSET}/${im.file}.webp`} alt="" width={im.w} height={im.h} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="cgr-dt-info" style={nameStyle}>
        <p className="mono cgr-dt-meta">
          no.{no} / {CATEGORY_LABEL[gown.category].toLowerCase()} / example listing
        </p>
        <p className="cgr-dt-price ext">
          {formatPhp(gown.pricePerDay)}
          <span>a day</span>
        </p>
        <dl className="cgr-dt-specs mono">
          <dt>fit</dt>
          <dd>{sizes} (example)</dd>
          <dt>colour</dt>
          <dd>{gown.colors.join(", ")}</dd>
          <dt>rate</dt>
          <dd>{formatPhp(gown.pricePerDay)} a day, example rate</dd>
          <dt>hold</dt>
          <dd>a date request with a CGR reference code</dd>
        </dl>
        <p className="cgr-dt-blurb">{gown.blurb}</p>

        <div className="cgr-cal" aria-label="Sample calendar">
          <div className="cgr-cal-top">
            <p className="cgr-cal-month" aria-live="polite">
              {MONTH[vm]} {vy}
            </p>
            <p className="mono cgr-cal-key">struck = already held</p>
            <div className="cgr-cal-nav">
              <button type="button" className="cgr-cal-arrow" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month">
                ←
              </button>
              <button type="button" className="cgr-cal-arrow" onClick={() => shift(1)} aria-label="Next month">
                →
              </button>
            </div>
          </div>
          <div className="cgr-cal-grid">
            {CAL_HEAD.map((h, i) => (
              <span key={`h${i}`} className="cgr-cal-head mono" aria-hidden="true">
                {h}
              </span>
            ))}
            {Array.from({ length: CAL_CELLS }, (_, i) => {
              const d = i - first + 1;
              if (d < 1 || d > days) return <span key={i} className="cgr-cal-day is-pad" aria-hidden="true" />;
              const di = iso(vy, vm, d);
              const past = !ready || di < (today ?? "");
              const held = ready && !past && !isDateFree(gown.slug, di, gown.bookedDates, bookings ?? []);
              const on = di === date;
              const cls = ["cgr-cal-day", on ? "is-on" : "", held ? "is-held" : "", past ? "is-past" : ""]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={di}
                  type="button"
                  className={cls}
                  disabled={past || held}
                  aria-pressed={on}
                  aria-label={`${humanDate(di)}${held ? ", already held" : past ? ", past" : ", open"}`}
                  onClick={() => setPicked(di)}
                >
                  <span>{d}</span>
                </button>
              );
            })}
          </div>
          <p className="mono cgr-dt-status" role="status">
            {!ready
              ? "checking the sample calendar…"
              : free
                ? `${humanDate(date).toLowerCase()} is open in the sample calendar.`
                : `${humanDate(date).toLowerCase()} is already held in the sample calendar.`}
          </p>
        </div>

        <div className="cgr-dt-cta">
          {holdHref ? (
            <Link className="btn btn-ox" href={holdHref}>
              Hold this gown for {ctaLabel}
            </Link>
          ) : (
            <span className="btn btn-ox is-disabled" aria-disabled="true">
              Pick an open date
            </span>
          )}
          <Link className="ulink" href="#visit">
            ask about a fitting
          </Link>
        </div>
      </div>

      <div className="cgr-dt-bar dark">
        {holdHref ? (
          <Link className="btn btn-hot" href={holdHref}>
            Hold for {ctaLabel}
          </Link>
        ) : (
          <span className="btn btn-hot is-disabled" aria-disabled="true">
            Pick a date
          </span>
        )}
        <Link className="ulink" href="#visit">
          fitting?
        </Link>
      </div>
    </div>
  );
}
