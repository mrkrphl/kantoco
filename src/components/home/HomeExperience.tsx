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

      const pin = root.querySelector<HTMLElement>(".home-opener");
      const frame = root.querySelector<HTMLElement>(".home-opener-frame");
      const img = root.querySelector<HTMLElement>(".home-opener-img");
      const copy = root.querySelector<HTMLElement>(".home-opener-copy");
      if (!pin || !frame) return;

      gsap.set(frame, { clipPath: "inset(0 34% 0 34%)" });
      if (img) gsap.set(img, { scale: 1.18, transformOrigin: "55% 40%" });
      if (copy) gsap.set(copy, { autoAlpha: 0, y: 28 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: "+=175%",
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(frame, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15 }, 0);
      if (img) tl.to(img, { scale: 1, duration: 1.15 }, 0);
      if (copy) {
        tl.to(copy, { autoAlpha: 1, y: 0, duration: 0.32 }, 0.62);
      }

      revealOnScroll(
        gsap,
        gsap.utils.toArray<HTMLElement>("[data-reveal]", root),
      );

      gsap.utils.toArray<HTMLElement>(".home-shop-frame", root).forEach((el) => {
        const photo = el.querySelector("img");
        const name = el.parentElement?.querySelector(".home-shop-name");
        if (photo) {
          gsap.fromTo(
            photo,
            { scale: 1.1 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.45,
              },
            },
          );
        }
        if (name) {
          gsap.fromTo(
            name,
            { autoAlpha: 0, y: 18 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 72%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }
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
        <section className="home-opener" aria-label="Night corner in Parañaque">
          <div className="home-opener-frame">
            <Image
              src="/kanto-street.jpg"
              alt="Night corner shops on a Parañaque street"
              fill
              sizes="100vw"
              preload
              className="home-opener-img"
            />
          </div>
          <div className="home-opener-copy">
            <p className="home-p-lead">
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
          <div className="home-samples-intro" data-reveal>
            <p className="home-p">
              These are samples, not real client work. A clinic, a salon, an
              auto shop, and a few more playful ones so you can see the range.
            </p>
          </div>
          <ol className="home-shops">
            {shops.map((shop) => (
              <li key={shop.href} className="home-shop">
                <Link href={shop.href}>
                  <span className="home-shop-frame">
                    <Image
                      src={shop.src}
                      alt={shop.alt}
                      fill
                      sizes="100vw"
                    />
                    <span className="home-shop-name">{shop.name}</span>
                  </span>
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
