"use client";

import { useEffect, useState } from "react";

// r7.3.1 font gate. With display "block" the text is invisible until its face
// arrives, but it is still laid out with the fallback's metrics, so when Anton
// lands, "Cavite." (placed after the width of "in Dasmariñas,"), the header nav
// (placed by the width of the Anton "Hold a gown" button), the magnet label,
// the rotated script and the centred sample bar all move: that was the 1440
// cold-load CLS. Chrome does not score shifts of visibility-hidden boxes, so
// those few nodes stay hidden (cgr.css, "Font gate") until their faces have
// loaded, then show in their final place. Nothing changes once fonts are in;
// a CSS failsafe shows them after 3s even if a font never loads.
// Basic Latin only, so the gate never pulls a subset the page would not load.
const TEXT = "Aa";
const LIMIT_MS = 3000;
// Without JS the gate never opens, and reduced motion strips the CSS failsafe
// animation, so noscript shows the gated nodes straight away.
const NOSCRIPT_CSS =
  ".cgr-fonts :is(.cgr-bar-inner,.cgr-head-nav,.cgr-head-mob,.cgr-intro-h,.magnet-l,.cgr-hand-fix,.cgr-hand-stack){visibility:visible!important}";

export function FontGate({
  className,
  families,
  children,
}: {
  className: string;
  families: string[];
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
    Promise.allSettled(families.map((f) => fonts.load(`400 16px ${f.split(",")[0].trim()}`, TEXT))).then(done);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [families]);

  return (
    <div className={className} data-fonts={ready ? "ready" : undefined}>
      <noscript>
        <style>{NOSCRIPT_CSS}</style>
      </noscript>
      {children}
    </div>
  );
}
