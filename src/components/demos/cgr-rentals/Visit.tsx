import { cgr } from "@/lib/cgr-rentals";

export function VisitSection() {
  return (
    <section
      className="cgr-wrap cgr-visit"
      id="visit"
      aria-labelledby="cgr-visit-h"
    >
      <div className="cgr-visit-head">
        <p className="cgr-micro">Visit</p>
        <h2 className="cgr-h2" id="cgr-visit-h">
          Hours and location
        </h2>
      </div>
      <div className="cgr-visit-grid">
        <div className="cgr-visit-card">
          <h3 className="cgr-visit-title cgr-micro">Hours</h3>
          <ul className="cgr-hours">
            {cgr.hours.map((h) => (
              <li key={h.day}>
                <span>{h.day}</span>
                <span>{h.time}</span>
              </li>
            ))}
          </ul>
          <p className="cgr-mute">{cgr.hoursNote}</p>
        </div>
        <div className="cgr-visit-card">
          <h3 className="cgr-visit-title cgr-micro">Location</h3>
          <p className="cgr-addr">{cgr.address}</p>
          <a
            className="cgr-link"
            href={cgr.maps}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps
          </a>
        </div>
        <div className="cgr-visit-card">
          <h3 className="cgr-visit-title cgr-micro">Messenger</h3>
          <p className="cgr-mute">
            Public Facebook Page link only. This sample never messages the shop.
          </p>
          <a
            className="cgr-btn"
            href={cgr.messenger}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message on Facebook
          </a>
          <a
            className="cgr-link"
            href={cgr.facebook}
            target="_blank"
            rel="noopener noreferrer"
          >
            facebook.com/CaviteGownRentals
          </a>
        </div>
      </div>
    </section>
  );
}
