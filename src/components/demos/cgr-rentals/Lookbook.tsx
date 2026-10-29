"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { CGR_ASSET, CGR_BASE, formatPhp, type Gown } from "@/lib/cgr-rentals";
import { useMotionReady } from "@/components/motion/useMotionReady";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Accessories lookbook: a CSS 3D page flip (harmozalea-style). Tap the right
 * or left half, drag a page, or use the buttons / arrow keys. Each leaf has a
 * front and a back face; hidden faces are inert so focus never lands behind.
 * Reduced motion: hidden by CSS; the plain accessories grid below remains.
 */
export function Lookbook({ items }: { items: Gown[] }) {
  const bookRef = useRef<HTMLDivElement>(null);
  const leavesRef = useRef<HTMLDivElement[]>([]);
  const goRef = useRef<(i: number) => void>(() => {});
  const { ready, reduced } = useMotionReady();

  // Faces: cover, items..., back cover. Two faces per leaf.
  const faces: ReactNode[] = [
    <Cover key="cover" />,
    ...items.map((it, i) => <Page key={it.slug} item={it} n={i + 1} />),
    <BackCover key="back" />,
  ];
  while (faces.length % 2) faces.push(<div key={`blank-${faces.length}`} />);
  const leaves = faces.length / 2;
  const [spread, setSpread] = useState(0);

  useEffect(() => {
    const book = bookRef.current;
    if (!book || !ready || reduced) return;
    const els = leavesRef.current.slice(0, leaves);
    const st = { flip: 0 };
    let raf = 0;
    let last = -1;

    const render = () => {
      raf = 0;
      const F = st.flip;
      els.forEach((el, i) => {
        const f = clamp(F - i, 0, 1);
        el.style.transform = `rotateY(${(-180 * f).toFixed(2)}deg)`;
        const moving = f > 0 && f < 1;
        el.style.zIndex = String(moving ? leaves + 2 : f >= 0.5 ? i + 1 : leaves - i);
        const sh = Math.sin(Math.PI * f) * 0.45;
        el.style.setProperty("--lb-shade", sh.toFixed(3));
      });
      // Closed book: center the cover. Finished: center the back cover.
      const shift = F < 1 ? -(1 - F) : F > leaves - 1 ? F - (leaves - 1) : 0;
      book.style.setProperty("--lb-shift", shift.toFixed(3));
      const s = Math.round(F);
      if (s !== last) {
        last = s;
        setSpread(s);
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    let tween: gsap.core.Tween | null = null;
    const to = (target: number) => {
      tween?.kill();
      const t = clamp(Math.round(target), 0, leaves);
      tween = gsap.to(st, {
        flip: t,
        duration: 0.5 + Math.abs(t - st.flip) * 0.25,
        ease: "power2.inOut",
        onUpdate: kick,
      });
    };
    goRef.current = to;

    let down = false;
    let dragging = false;
    let sx = 0;
    let sy = 0;
    let sf = 0;
    let vel = 0;
    let lastX = 0;
    let lastT = 0;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest("a,button")) return;
      down = true;
      dragging = false;
      sx = lastX = e.clientX;
      sy = e.clientY;
      sf = st.flip;
      vel = 0;
      lastT = performance.now();
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (!dragging) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - sy)) return;
        dragging = true;
        tween?.kill();
        book.setPointerCapture(e.pointerId);
        book.classList.add("is-dragging");
      }
      const now = performance.now();
      vel = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
      const pageW = book.clientWidth / 2;
      st.flip = clamp(sf - dx / pageW, 0, leaves);
      kick();
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      if (dragging) {
        book.classList.remove("is-dragging");
        const fling = Math.abs(vel) > 0.4 ? -Math.sign(vel) * 0.5 : 0;
        to(st.flip + fling);
      } else {
        const r = book.getBoundingClientRect();
        const mid = r.left + r.width / 2;
        const cur = Math.round(st.flip);
        // Closed book or back cover: any tap turns the one way that is possible.
        const dir = cur === 0 ? 1 : cur === leaves ? -1 : e.clientX >= mid ? 1 : -1;
        to(cur + dir);
      }
      dragging = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") to(Math.round(st.flip) + 1);
      else if (e.key === "ArrowLeft") to(Math.round(st.flip) - 1);
      else return;
      e.preventDefault();
    };
    book.addEventListener("pointerdown", onDown);
    book.addEventListener("pointermove", onMove);
    book.addEventListener("pointerup", onUp);
    book.addEventListener("pointercancel", onUp);
    book.addEventListener("keydown", onKey);
    book.dataset.flip = "on";
    render();
    return () => {
      tween?.kill();
      if (raf) cancelAnimationFrame(raf);
      book.removeEventListener("pointerdown", onDown);
      book.removeEventListener("pointermove", onMove);
      book.removeEventListener("pointerup", onUp);
      book.removeEventListener("pointercancel", onUp);
      book.removeEventListener("keydown", onKey);
      delete book.dataset.flip;
    };
  }, [ready, reduced, leaves]);

  // Visible faces at rest: back of leaf (spread-1), front of leaf (spread).
  const visible = (face: number) => {
    const leaf = Math.floor(face / 2);
    return face % 2 === 0 ? leaf === spread : leaf === spread - 1;
  };
  const label =
    spread === 0
      ? "Cover"
      : spread === leaves
        ? "Back cover"
        : `Pages ${spread * 2 - 1}–${spread * 2} of ${items.length}`;

  return (
    <div className="cgr-lb" aria-roledescription="lookbook" aria-label="Accessories lookbook">
      <div
        ref={bookRef}
        className="cgr-lb-book"
        tabIndex={0}
        aria-label="Lookbook. Use left and right arrow keys to turn pages."
      >
        {Array.from({ length: leaves }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) leavesRef.current[i] = el;
            }}
            className="cgr-lb-leaf"
            style={{ zIndex: leaves - i }}
          >
            <div className="cgr-lb-face cgr-lb-front" inert={!visible(i * 2)}>
              {faces[i * 2]}
              <span className="cgr-lb-shade" aria-hidden="true" />
            </div>
            <div className="cgr-lb-face cgr-lb-back" inert={!visible(i * 2 + 1)}>
              {faces[i * 2 + 1]}
              <span className="cgr-lb-shade" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
      <div className="cgr-lb-ctrl">
        <button
          type="button"
          className="cgr-cf-arrow"
          onClick={() => goRef.current(spread - 1)}
          disabled={spread === 0}
          aria-label="Previous page"
        >
          <span aria-hidden="true">←</span>
        </button>
        <p className="cgr-lb-count" aria-live="polite">
          {label}
        </p>
        <button
          type="button"
          className="cgr-cf-arrow"
          onClick={() => goRef.current(spread + 1)}
          disabled={spread === leaves}
          aria-label="Next page"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

function Cover() {
  return (
    <div className="cgr-lb-cover">
      <p className="cgr-lb-kick">CGR · Lookbook</p>
      <p className="cgr-lb-ctitle">The crown room</p>
      <p className="cgr-lb-csub">Tiaras, crowns and crystals to finish the gown.</p>
      <p className="cgr-lb-hintc">Tap or drag to turn →</p>
    </div>
  );
}

function BackCover() {
  return (
    <div className="cgr-lb-cover cgr-lb-backcover">
      <p className="cgr-lb-ctitle">Pick a piece.</p>
      <p className="cgr-lb-csub">Every one can ride along on a gown hold.</p>
      <a className="cgr-btn cgr-btn-gold" href="#cgr-acc-grid">
        See all accessories
      </a>
    </div>
  );
}

function Page({ item, n }: { item: Gown; n: number }) {
  const img = item.images[0];
  return (
    <div className="cgr-lb-page">
      <div className="cgr-lb-img">
        <img
          src={`${CGR_ASSET}/${img.file}.webp`}
          alt={img.alt}
          width={img.w}
          height={img.h}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>
      <p className="cgr-lb-no">No. {String(n).padStart(2, "0")}</p>
      <p className="cgr-lb-name">{item.name}</p>
      <p className="cgr-lb-price">{formatPhp(item.pricePerDay)} / day · sample</p>
      <Link className="cgr-lb-link" href={`${CGR_BASE}/gown/${item.slug}`}>
        View &amp; check dates
      </Link>
    </div>
  );
}
