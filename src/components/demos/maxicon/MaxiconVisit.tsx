import { maxicon } from "@/lib/maxicon";

export function MaxiconVisit({
  id = "visit",
}: {
  id?: string;
}) {
  return (
    <section id={id} className="maxicon-visit">
      <p className="maxicon-visit-kicker">{maxicon.address}</p>
      <p className="maxicon-mono maxicon-hours">{maxicon.hours}</p>
      <a href={maxicon.phoneMobileHref} className="maxicon-dial">
        {maxicon.phoneMobileDisplay}
      </a>
      <a href={maxicon.emailHref} className="maxicon-email">
        {maxicon.email}
      </a>
      <a
        href={maxicon.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="maxicon-facebook"
      >
        Facebook
      </a>
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
    </section>
  );
}
