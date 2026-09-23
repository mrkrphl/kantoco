import Image from "next/image";
import { AlondayShell } from "@/components/demos/alonday/AlondayShell";
import { alonday } from "@/lib/alonday";

export default function AlondayServices() {
  return (
    <AlondayShell current="Services">
      <div className="alonday-page">
        <p className="alonday-kicker">Services</p>
        <h1 className="alonday-title">The work they already post.</h1>
        <p className="alonday-lede">
          The first five come from their Facebook About. Crowns, composite,
          fillings, dentures, and whitening come from public posts. This sample
          does not add a price. Facebook stills sit on the reserved tiles.
        </p>
        <ul className="alonday-tiles">
          {alonday.services.map((row) => (
            <li key={row.name} className="alonday-tile">
              {row.photos.length > 0 ? (
                <div
                  className={
                    row.photos.length > 1
                      ? "alonday-tile-photos"
                      : "alonday-tile-photo"
                  }
                >
                  {row.photos.map((src) => (
                    <div key={src} className="alonday-tile-shot">
                      <Image
                        src={src}
                        alt={row.photoAlt ?? row.name}
                        fill
                        sizes="(max-width: 720px) 100vw, 38vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alonday-tile-photo alonday-tile-photo--empty" aria-hidden>
                  <p>{row.photoNote ?? "No still on this tile yet."}</p>
                </div>
              )}
              <h2 className="alonday-tile-name">{row.name}</h2>
              <p className="alonday-tile-line">{row.line}</p>
            </li>
          ))}
        </ul>
        <p className="alonday-note alonday-foot">{alonday.sampleNote}</p>
      </div>
    </AlondayShell>
  );
}
