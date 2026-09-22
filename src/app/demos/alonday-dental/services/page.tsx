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
          does not add a price. Facebook stills that could not be downloaded
          stay as named slots.
        </p>
        <ul className="alonday-tiles">
          {alonday.services.map((row) => (
            <li key={row.name} className="alonday-tile">
              <div className="alonday-tile-photo" aria-hidden={!row.photo}>
                <p>{row.photoNote ?? "No still on this tile yet."}</p>
              </div>
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
