import { MaxiconShell } from "@/components/demos/maxicon/MaxiconShell";
import { maxicon } from "@/lib/maxicon";

const parts = [
  "Compressors",
  "Condensers",
  "Evaporators",
  "Expansion valves",
  "Driers",
  "Auxiliary fans",
];

const repair = [
  "Computerized scanning and trouble codes",
  "Aircon performance evaluation and outlet temperature",
  "System pressure readings",
  "Leak test",
  "Flush and pulldown for a full clean",
  "Freon recharge to spec",
  "Belt, hose, and condenser-fin check",
  "Drier, expansion valve, and cabin filter when the job needs them",
];

export default function MaxiconServices() {
  return (
    <MaxiconShell current="Work">
      <div className="maxicon-page">
        <p className="maxicon-kicker">Work</p>
        <h1 className="maxicon-display maxicon-title">
          What the public page already says they do.
        </h1>
        <p className="maxicon-lede">
          No sample rates here. A live shop writes its own board. This list
          follows their public Wix page and Facebook intro: parts, repair,
          diagnostics, leak test, flush, and recharge.
        </p>

        <div className="maxicon-split mt-12">
          <section>
            <p className="maxicon-kicker">Parts</p>
            <h2 className="maxicon-display mt-3 text-4xl">
              OEM and replacement
            </h2>
            <ul className="maxicon-jobs">
              {parts.map((item) => (
                <li key={item}>
                  <p className="text-lg">{item}</p>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <p className="maxicon-kicker">Repair</p>
            <h2 className="maxicon-display mt-3 text-4xl">
              Full-service aircon
            </h2>
            <ul className="maxicon-jobs">
              {repair.map((item) => (
                <li key={item}>
                  <p className="text-lg">{item}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="maxicon-lede">
          {maxicon.recentPost} Their Facebook page is the live record of jobs.
          This sample does not invent a diagnosis.
        </p>

        <div className="maxicon-cta-row">
          <a href={maxicon.phoneMobileHref} className="maxicon-cta">
            Call {maxicon.phoneMobileDisplay}
          </a>
          <a
            href={maxicon.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="maxicon-cta-ghost"
          >
            Facebook
          </a>
        </div>
        <p className="maxicon-note">
          {maxicon.sampleNote}{" "}
          <a
            href={maxicon.kantocoMessenger}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message KantoCo
          </a>
          .
        </p>
      </div>
    </MaxiconShell>
  );
}
