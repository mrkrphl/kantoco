"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "@/lib/config";
import { revealOnScroll } from "@/lib/motion";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const shops = [
  {
    href: "/demos/nara-clinic",
    name: "Nara Clinic",
    src: "/demos/nara-clinic/hallway-daylight.jpg",
    alt: "Empty clinic beds in daylight",
  },
  {
    href: "/demos/amihan-salon",
    name: "Amihan Salon",
    src: "/demos/amihan-salon/mirrors.jpg",
    alt: "Salon wash station and a long mirror",
  },
  {
    href: "/demos/haligi-auto",
    name: "Haligi Auto Care",
    src: "/demos/haligi-auto/lift.jpg",
    alt: "Car on a two-post lift in a working bay",
  },
  {
    href: "/demos/aninag-studio",
    name: "Aninag Studio",
    src: "/demos/aninag-studio/studio-room.jpg",
    alt: "Empty photo studio with a white cyc wall",
  },
  {
    href: "/demos/hinog-bakery",
    name: "Hinog Bakery",
    src: "/demos/hinog-bakery/pandesal-bowl.jpg",
    alt: "A wooden bowl of fresh pan de sal",
  },
  {
    href: "/demos/buhol-blooms",
    name: "Buhol Blooms",
    src: "/demos/buhol-blooms/buckets.jpg",
    alt: "Kraft-wrapped flowers in galvanized buckets",
  },
] as const;

function MessageLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={site.messengerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

export function HomeExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;

      const frame = root.querySelector<HTMLElement>(".home-opener-frame");
      const copy = root.querySelector<HTMLElement>(".home-opener-copy");
      if (frame) {
        gsap.set(frame, { clipPath: "inset(0 48% 0 48%)", scale: 1.08 });
      }
      if (copy) {
        gsap.set(copy, { autoAlpha: 0, y: 24 });
      }

      const opener = gsap.timeline({ defaults: { ease: "power3.inOut" } });
      if (frame) {
        opener.to(frame, {
          clipPath: "inset(0% 0% 0% 0%)",
          scale: 1,
          duration: 1.4,
        });
      }
      if (copy) {
        opener.to(
          copy,
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "-=0.4",
        );
      }

      revealOnScroll(
        gsap,
        gsap.utils.toArray<HTMLElement>("[data-reveal]", root),
      );

      gsap.utils.toArray<HTMLElement>(".home-shop-frame", root).forEach((el) => {
        const img = el.querySelector("img");
        if (!img) return;
        gsap.fromTo(
          img,
          { scale: 1.06 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.4,
            },
          },
        );
      });
    },
    { scope: rootRef, dependencies: [ready, reduced] },
  );

  const motion = reduced ? "static" : ready ? "ready" : "pending";

  return (
    <div ref={rootRef} className="home" data-motion={motion}>
      <header className="home-bar">
        <a href="#top" className="home-mark">
          <Image
            src="/mark.png"
            alt="KantoCo"
            width={36}
            height={36}
            className="home-mark-img"
            preload
          />
          <span>KantoCo</span>
        </a>
        <nav className="home-nav">
          <a href="#samples">Samples</a>
          <MessageLink className="home-btn">Message us on Facebook</MessageLink>
        </nav>
      </header>

      <main id="top" className="home-main">
        <section className="home-opener" aria-label="Studio photograph">
          <div className="home-opener-frame">
            <Image
              src="/hero-street.jpg"
              alt="Night corner shops on a Parañaque street"
              fill
              sizes="100vw"
              preload
              className="home-opener-img"
            />
          </div>
          <div className="home-opener-copy">
            <p className="home-p home-p-lead">
              We’re KantoCo. We make websites for small businesses in Parañaque
              and nearby.
            </p>
          </div>
        </section>

        <section className="home-block" data-reveal>
          <p className="home-p">
            If people only find you on Facebook, a simple site helps: what you
            do, when you’re open, and a button that messages us.
          </p>
        </section>

        <section id="samples" className="home-samples">
          <p className="home-p" data-reveal>
            These are samples, not real client work. A clinic, a salon, an auto
            shop, and a few more playful ones so you can see the range.
          </p>
          <ol className="home-shops">
            {shops.map((shop) => (
              <li key={shop.href} className="home-shop" data-reveal>
                <Link href={shop.href}>
                  <span className="home-shop-frame">
                    <Image
                      src={shop.src}
                      alt={shop.alt}
                      fill
                      sizes="(max-width: 720px) 100vw, 72rem"
                    />
                  </span>
                  <span className="home-shop-name">{shop.name}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="home-offer" data-reveal>
          <p className="home-p">
            One package, <span className="home-peso">₱15,000</span>, paid once.
            Domain and hosting are separate. We usually need about a week after
            we have your photos.
          </p>
          <p className="home-p">
            If you want to talk, message us on Facebook.
          </p>
          <p className="home-cta-wrap">
            <MessageLink className="home-btn home-btn-lg">
              Message us on Facebook
            </MessageLink>
          </p>
        </section>
      </main>

      <footer className="home-foot">
        <p>KantoCo</p>
        <MessageLink>Message us on Facebook</MessageLink>
      </footer>
    </div>
  );
}
