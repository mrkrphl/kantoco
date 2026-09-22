import { AlondayShell } from "@/components/demos/alonday/AlondayShell";
import { alonday } from "@/lib/alonday";

export default function AlondayServices() {
  return (
    <AlondayShell current="Services">
      <div className="alonday-page">
        <p className="alonday-kicker">Services</p>
        <h1 className="alonday-title">
          What their Facebook About already lists.
        </h1>
        <p className="alonday-lede">
          These five lines come from the public About on Alonday Dental
          Clinic’s Facebook page. This sample does not add a price, a package,
          or a treatment plan.
        </p>
        <ol className="alonday-service-list">
          {alonday.services.map((row) => (
            <li key={row.n} className="alonday-chair is-lit">
              <p className="alonday-chair-name">
                <span className="alonday-num">{row.n}</span>
                {row.name}
              </p>
              <p className="alonday-chair-line">{row.line}</p>
            </li>
          ))}
        </ol>
        <p className="alonday-note alonday-foot">{alonday.sampleNote}</p>
      </div>
    </AlondayShell>
  );
}
