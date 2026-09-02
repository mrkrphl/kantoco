import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/config";
import "./home.css";

const shops = [
  {
    href: "/demos/nara-clinic",
    name: "Nara Clinic",
    src: "/demos/nara-clinic/hallway-daylight.jpg",
    alt: "Empty clinic beds in daylight",
    shape: "tall",
  },
  {
    href: "/demos/amihan-salon",
    name: "Amihan Salon",
    src: "/demos/amihan-salon/mirrors.jpg",
    alt: "Salon wash station and a long mirror",
    shape: "wide",
  },
  {
    href: "/demos/haligi-auto",
    name: "Haligi Auto Care",
    src: "/demos/haligi-auto/lift.jpg",
    alt: "Car on a two-post lift in a working bay",
    shape: "sq",
  },
  {
    href: "/demos/aninag-studio",
    name: "Aninag Studio",
    src: "/demos/aninag-studio/studio-room.jpg",
    alt: "Empty photo studio with a white cyc wall",
    shape: "wide",
  },
  {
    href: "/demos/hinog-bakery",
    name: "Hinog Bakery",
    src: "/demos/hinog-bakery/pandesal-bowl.jpg",
    alt: "A wooden bowl of fresh pan de sal",
    shape: "sq",
  },
  {
    href: "/demos/buhol-blooms",
    name: "Buhol Blooms",
    src: "/demos/buhol-blooms/buckets.jpg",
    alt: "Kraft-wrapped flowers in galvanized buckets",
    shape: "tall",
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

export default function Home() {
  return (
    <div className="home">
      <header className="home-bar">
        <a href="#top" className="home-mark">
          <Image
            src="/mark.png"
            alt="KantoCo"
            width={32}
            height={32}
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
        <p className="home-p home-p-lead">
          We’re KantoCo. We make websites for small businesses in Parañaque and
          nearby.
        </p>
        <p className="home-p">
          If people only find you on Facebook, a simple site helps: what you do,
          when you’re open, and a button that messages us.
        </p>

        <section id="samples" className="home-samples">
          <p className="home-p">
            These are samples, not real client work. A clinic, a salon, an auto
            shop, and a few more playful ones so you can see the range.
          </p>
          <ol className="home-shops">
            {shops.map((shop) => (
              <li key={shop.href} className={`home-shop home-shop-${shop.shape}`}>
                <Link href={shop.href}>
                  <span className="home-shop-frame">
                    <Image
                      src={shop.src}
                      alt={shop.alt}
                      fill
                      sizes="(max-width: 700px) 80vw, 320px"
                    />
                  </span>
                  <span className="home-shop-name">{shop.name}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <p className="home-p">
          One package, <span className="home-peso">₱15,000</span>, paid once.
          Domain and hosting are separate. We usually need about a week after we
          have your photos.
        </p>
        <p className="home-p">
          If you want to talk, message us on Facebook.
        </p>
        <p className="home-cta-wrap">
          <MessageLink className="home-btn home-btn-lg">
            Message us on Facebook
          </MessageLink>
        </p>
      </main>

      <footer className="home-foot">
        <p>KantoCo</p>
        <MessageLink>Message us on Facebook</MessageLink>
      </footer>
    </div>
  );
}
