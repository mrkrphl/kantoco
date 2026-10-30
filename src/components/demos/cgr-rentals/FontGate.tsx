"use client";

import { useEffect, useState } from "react";

// r7.3.1 font gate (r7.5: Cormorant Garamond, Figtree, Great Vibes). With
// display "block" the text is invisible until its face arrives, but it is
// still laid out with the fallback's metrics, so when the faces land the h1
// lines, the rotator (placed after "Cavite."), the header nav and the centred
// sample bar would all move: that was the r7.3 cold-load CLS. Chrome does not score shifts of visibility-hidden boxes, so
// those few nodes stay hidden (cgr.css, "Font gate") until their faces have
// loaded, then show in their final place. Nothing changes once fonts are in;
// a CSS failsafe shows them after 3s even if a font never loads.
// Each face loads only the text the first screen sets (Basic Latin, plus the
// ₱ of the hero rate for the body face), so the gate never pulls a subset the
// page would not load.
const LIMIT_MS = 3000;
// Without JS the gate never opens, and reduced motion strips the CSS failsafe
// animation, so noscript shows the gated nodes straight away.
const NOSCRIPT_CSS =
  ".cgr-fonts :is(.cgr-bar-inner,.cgr-wm,.cgr-head-nav,.cgr-head-mob,.cgr-intro-word,.cgr-intro-copy,.cgr-intro-hand){visibility:visible!important}";

export function FontGate({
  className,
  faces,
  children,
}: {
  className: string;
  /** CSS font shorthand ("italic 400 16px Family") and the text to load it for. */
  faces: { font: string; text: string }[];
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    const done = () => {
      if (live) setReady(true);
    };
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    if (!fonts) {
      done();
      return;
    }
    const timer = window.setTimeout(done, LIMIT_MS);
    // Only the first family of each stack: the "… Fallback" faces are local()
    // and reject where that system font is missing, which would end the wait early.
    Promise.allSettled(faces.map((f) => fonts.load(f.font, f.text))).then(done);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [faces]);

  return (
    <div className={className} data-fonts={ready ? "ready" : undefined}>
      <noscript>
        <style>{NOSCRIPT_CSS}</style>
      </noscript>
      {children}
    </div>
  );
}
