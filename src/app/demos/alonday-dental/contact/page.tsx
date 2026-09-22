import { AlondayShell } from "@/components/demos/alonday/AlondayShell";
import { alonday } from "@/lib/alonday";

export default function AlondayContact() {
  return (
    <AlondayShell current="Contact">
      <div className="alonday-page">
        <p className="alonday-kicker">Contact</p>
        <h1 className="alonday-title">Message them on Facebook.</h1>
        <p className="alonday-lede">
          Call, Instagram, or Facebook. The appointment fields below do not
          send. This sample is not live.
        </p>
        <p className="alonday-dial-wrap">
          <a href={alonday.phoneHref} className="alonday-dial">
            {alonday.phoneDisplay}
          </a>
        </p>
        <div className="alonday-visit-links">
          <a
            href={alonday.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="alonday-btn alonday-btn--teal"
          >
            Message on Facebook
          </a>
          <a
            href={alonday.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram {alonday.instagramHandle}
          </a>
        </div>

        <form className="alonday-mock" aria-describedby="alonday-mock-note">
          <p className="alonday-kicker">Appointment request — not live</p>
          <label>
            Name
            <input type="text" name="name" disabled placeholder="Sample only" />
          </label>
          <label>
            Phone
            <input type="tel" name="phone" disabled placeholder="Sample only" />
          </label>
          <label>
            Preferred day
            <input type="text" name="day" disabled placeholder="Monday to Saturday" />
          </label>
          <label>
            Note
            <textarea name="note" disabled rows={3} placeholder="This form does not send." />
          </label>
          <button type="button" disabled>
            Send request (disabled)
          </button>
          <p id="alonday-mock-note" className="alonday-note">
            Use the Facebook button above to reach the clinic. The fields stay
            on the page so a shop owner can see a contact layout.
          </p>
        </form>

        <p className="alonday-note alonday-foot">
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
      </div>
    </AlondayShell>
  );
}
