import Image from "next/image";
import Link from "next/link";
import { DEMO_BADGE, DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

export function BuholExperience() {
  return (
    <div className="buhol">
      <p className="buhol-banner">{DEMO_DISCLAIMER}</p>

      <div className="buhol-mast">
        <p style={{ fontSize: 11, letterSpacing: "0.14em" }}>{DEMO_BADGE}</p>
        <p className="buhol-hand">buhol</p>
        <h1 className="buhol-word">Blooms</h1>
        <p style={{ maxWidth: "28rem", marginTop: "0.9rem", lineHeight: 1.5 }}>
          Sample wrap stall at Moonwalk market, Parañaque. Stems by the bunch,
          funeral work, and table bunches tied with a rubber band. Fictional
          pitch. Not a real florist.
        </p>
      </div>

      <div className="buhol-buckets">
        <div className="buhol-bucket">
          <Image
            src="/demos/buhol-blooms/buckets.jpg"
            alt="Kraft-wrapped asters standing in galvanized buckets at a market stall"
            fill
            sizes="(min-width: 800px) 55vw, 100vw"
            preload
          />
        </div>
        <div className="buhol-bucket">
          <Image
            src="/demos/buhol-blooms/wrap.jpg"
            alt="Wrapped bouquet of red and peach blooms seen from above"
            fill
            sizes="(min-width: 800px) 35vw, 50vw"
          />
        </div>
      </div>

      <section className="buhol-rest">
        <div className="buhol-rest-inner">
          <div className="buhol-split">
            <div className="buhol-still" style={{ marginTop: 0, minHeight: 260 }}>
              <Image
                src="/demos/buhol-blooms/market-table.jpg"
                alt="Peonies in plastic buckets with handwritten cardboard prices on a market table"
                fill
                sizes="(min-width: 800px) 55vw, 100vw"
              />
            </div>
            <div className="buhol-board">
              <p>open when the ice holds</p>
              <dl>
                <dt>Hours</dt>
                <dd>Tuesday to Sunday, 8:00-18:00</dd>
                <dt>Monday</dt>
                <dd>Closed</dd>
                <dt>Work</dt>
                <dd>Stems by the bunch, plus funeral and table wraps.</dd>
              </dl>
            </div>
          </div>
          <ul className="buhol-stems">
            <li>
              <span>wrap</span>
              Newspaper or kraft, with no satin bow.
            </li>
            <li>
              <span>band</span>
              Rubber-band red. Count the stems.
            </li>
            <li>
              <span>bucket</span>
              Water, ice, and a hand-lettered card.
            </li>
          </ul>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="buhol-cta"
          >
            Message us on Facebook
          </a>
          <p className="buhol-foot">
            {DEMO_DISCLAIMER} No shop phone. No live orders.{" "}
            <Link href="/">Back to KantoCo</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
