import Image from "next/image";
import Link from "next/link";
import { DEMO_BADGE, DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

export function HinogExperience() {
  return (
    <div className="hinog">
      <p className="hinog-banner">{DEMO_DISCLAIMER}</p>

      <div className="hinog-hero">
        <div className="hinog-ticket">
          <p className="hinog-leaf">{DEMO_BADGE}</p>
          <h1 className="hinog-word">HINOG</h1>
          <p style={{ marginTop: "0.8rem", maxWidth: "22rem", lineHeight: 1.5 }}>
            Pan de sal in the morning pull, then monay and ensaymada until the
            trays empty. Sample stall off Quirino Avenue, Tambo, Parañaque.
            Fictional corner. Not a real bakery.
          </p>
          <p style={{ marginTop: "1rem" }}>
            Open daily 6:00-16:00. Last pull around 15:30. No table service.
          </p>
        </div>
        <div className="hinog-photo">
          <Image
            src="/demos/hinog-bakery/pandesal-bowl.jpg"
            alt="Wooden bowl of fresh pan de sal beside a cup of coffee"
            fill
            sizes="(min-width: 820px) 55vw, 100vw"
            preload
          />
          <div className="hinog-steam" aria-hidden>
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      <section className="hinog-rest">
        <div className="hinog-rest-inner">
          <h2>Counter, not a cafe</h2>
          <p style={{ maxWidth: "32rem", marginTop: "0.8rem", lineHeight: 1.55 }}>
            Take the bag. Hours sit on the stub. Prices here are a guide for
            this sample only.
          </p>
          <div className="hinog-split">
            <div className="hinog-still">
              <Image
                src="/demos/hinog-bakery/pandesal-bag.jpg"
                alt="Pan de sal packed in a plain brown paper bag"
                fill
                sizes="(min-width: 820px) 60vw, 100vw"
              />
            </div>
            <div className="hinog-stub">
              <p>
                Open <strong>daily 6:00-16:00</strong>
              </p>
              <p style={{ marginTop: "0.6rem" }}>Last pull around 15:30</p>
              <p style={{ marginTop: "0.6rem" }}>
                Sample stall off Quirino Avenue, Tambo, Parañaque
              </p>
            </div>
          </div>
          <ul className="hinog-menu">
            <li>
              <span>Pan de sal</span>
              <span>morning pull</span>
            </li>
            <li>
              <span>Monay</span>
              <span>crust, not cake</span>
            </li>
            <li>
              <span>Ensaymada</span>
              <span>cheese on top</span>
            </li>
          </ul>
          <div className="hinog-still" style={{ minHeight: 240, marginTop: "1.2rem" }}>
            <Image
              src="/demos/hinog-bakery/kape.jpg"
              alt="Hand dipping pan de sal into a mug of coffee"
              fill
              sizes="100vw"
            />
          </div>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="hinog-cta"
          >
            Message us on Facebook
          </a>
          <p className="hinog-foot">
            {DEMO_DISCLAIMER} No shop phone. No live orders.{" "}
            <Link href="/">Back to KantoCo</Link>
            <br />
            Pan de sal photos: Jessartcam, Obsidian Soul, and Froirivera, via
            Wikimedia Commons.
          </p>
        </div>
      </section>
    </div>
  );
}
