import { AlondayShell } from "@/components/demos/alonday/AlondayShell";
import { alonday } from "@/lib/alonday";

export default function AlondayHours() {
  return (
    <AlondayShell current="Hours">
      <div className="alonday-page">
        <p className="alonday-kicker">Hours and location</p>
        <h1 className="alonday-title">{alonday.address}</h1>
        <div className="alonday-hours-card">
          <p className="alonday-hours-card-kicker">From their public graphic</p>
          <p className="alonday-hours-card-line">{alonday.hours}</p>
          <p className="alonday-hours-card-note">{alonday.hoursNote}</p>
        </div>
        <p className="alonday-lede">
          The hours graphic they posted (photo-11, fbid 1126289316180788) says
          Monday to Saturday, 9:00 AM to 6:00 PM, and that walk-ins are
          accepted. Confirm the schedule on Facebook before you go. Sunday is
          not listed on that graphic.
        </p>
        <p className="alonday-lede">
          Directions: El Grande Avenue in BF Homes, Parañaque, postal code
          1718. The map below is a placeholder pin for that search, not a
          live shop widget.
        </p>
        <a
          href={alonday.mapsQuery}
          target="_blank"
          rel="noopener noreferrer"
          className="alonday-map-ph"
        >
          <span>Map placeholder</span>
          <span>Open 454 El Grande Ave. in Google Maps</span>
        </a>
        <p className="alonday-note alonday-foot">{alonday.sampleNote}</p>
      </div>
    </AlondayShell>
  );
}
