import { alonday } from "@/lib/alonday";

export function AlondayVisit({ id }: { id?: string }) {
  return (
    <section id={id} className="alonday-visit">
      <p className="alonday-kicker">Visit</p>
      <p className="alonday-visit-address">{alonday.address}</p>
      <p className="alonday-hours">{alonday.hours}</p>
      <a href={alonday.phoneHref} className="alonday-dial">
        {alonday.phoneDisplay}
      </a>
      <div className="alonday-visit-links">
        <a href={alonday.emailHref}>{alonday.email}</a>
        <a
          href={alonday.facebook}
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
        <a
          href={alonday.instagram}
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram {alonday.instagramHandle}
        </a>
        <a
          href={alonday.booking}
          target="_blank"
          rel="noopener noreferrer"
        >
          Book on their app
        </a>
      </div>
      <p className="alonday-note">
        {alonday.sampleNote}{" "}
        <a
          href={alonday.kantocoMessenger}
          target="_blank"
          rel="noopener noreferrer"
        >
          Message KantoCo
        </a>
        .
      </p>
    </section>
  );
}
