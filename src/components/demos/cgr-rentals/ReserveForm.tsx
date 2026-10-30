"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CGR_ASSET, CGR_BASE, formatPhp, type Gown } from "@/lib/cgr-rentals";
import { addBooking, isRangeFree, useBookings, useToday } from "@/components/demos/cgr-rentals/bookings";
import { StepHead } from "@/components/demos/cgr-rentals/Steps";
import {
  addDaysIso,
  customerTotal,
  defaultReturn,
  humanDate,
  rangeLabel,
  rentalDays,
} from "@/components/demos/cgr-rentals/reserveMath";

type Step = 1 | 2 | 3;
type Fields = { name: string; contact: string; occasion: string; notes: string };
const EMPTY: Fields = { name: "", contact: "", occasion: "", notes: "" };
const KEY = (slug: string) => `cgr-reserve-v1:${slug}`;

function parseStep(v: string | null): Step {
  return v === "2" ? 2 : v === "3" ? 3 : 1;
}

/**
 * r7.7 reserve flow (Design r7.7 spec §2, with Chip's calls): steps 01/02/03
 * with one question each. Step 01 shows and confirms the dates picked on the
 * gown page (no re-pick here; "Change" goes back to the gown's calendar).
 * The step lives in ?step= (browser back works) and the answers in
 * sessionStorage. Logic is unchanged from r7.6: the customer total is rate x
 * days, the commission never shows here, and the save mints a CGR code.
 */
export function ReserveForm({ gown, initialDate }: { gown: Gown; initialDate: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const step = parseStep(params.get("step"));
  const today = useToday();
  const bookings = useBookings();
  const uid = useId();

  const eventDate = initialDate || (today ? addDaysIso(today, 7) : "");
  const returnDate = defaultReturn(eventDate);
  const [f, setF] = useState<Fields>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"dates" | "name" | "contact", string>>>({});
  const headRef = useRef<HTMLHeadingElement>(null);
  const lastStep = useRef<Step>(step);

  // Answers persist per gown for this tab (sessionStorage), read after hydration.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(KEY(gown.slug));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setF({ ...EMPTY, ...(JSON.parse(raw) as Partial<Fields>) });
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [gown.slug]);
  useEffect(() => {
    if (!loaded) return;
    try {
      window.sessionStorage.setItem(KEY(gown.slug), JSON.stringify(f));
    } catch {
      /* ignore */
    }
  }, [f, loaded, gown.slug]);

  // Focus the step question on every step change (not on first paint).
  useEffect(() => {
    if (lastStep.current !== step) {
      lastStep.current = step;
      headRef.current?.focus({ preventScroll: false });
    }
  }, [step]);

  const days = rentalDays(eventDate, returnDate);
  const total = customerTotal(gown.pricePerDay, eventDate, returnDate);
  const past = today !== null && eventDate !== "" && eventDate < today;
  const checking = today === null || bookings === null;
  const free =
    !checking && days !== null && isRangeFree(gown.slug, eventDate, returnDate, gown.bookedDates, bookings ?? []);
  const datesOk = free && !past;
  const range = eventDate ? rangeLabel(eventDate, returnDate) : "";
  const gownHref = `${CGR_BASE}/gown/${gown.slug}`;
  // r7.8: "Change" reopens the gown's calendar on the dates already picked.
  const changeHref = eventDate ? `${gownHref}?date=${encodeURIComponent(eventDate)}#dates` : `${gownHref}#dates`;
  const img = gown.images[1] ?? gown.images[0];

  const dateStatus = checking
    ? "Checking the sample calendar…"
    : days === null
      ? "The return date must be on or after the pickup date."
      : past
        ? "That date has passed. Pick a new one on the gown page."
        : free
          ? `Open in the sample calendar, ${range}.`
          : `${range} is already reserved in the sample calendar. Pick another day on the gown page.`;

  function go(next: Step, clear = false) {
    if (clear) setErrors({});
    const q = new URLSearchParams(params.toString());
    if (next === 1) q.delete("step");
    else q.set("step", String(next));
    const qs = q.toString();
    window.history.pushState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }

  function checkDates(): boolean {
    if (datesOk) return true;
    setErrors({ dates: checking ? "Still checking the sample calendar. Try again in a moment." : dateStatus });
    return false;
  }

  function checkContact(): boolean {
    const e: typeof errors = {};
    if (!f.name.trim()) e.name = "Add your name.";
    if (!f.contact.trim()) e.contact = "Add a mobile number or Messenger name.";
    setErrors(e);
    return !e.name && !e.contact;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      if (checkDates()) go(2, true);
      return;
    }
    if (step === 2) {
      if (checkContact()) go(3);
      return;
    }
    if (!checkDates()) {
      go(1);
      return;
    }
    if (!checkContact()) {
      go(2);
      return;
    }
    const booking = addBooking({
      gownSlug: gown.slug,
      gownName: gown.name,
      eventDate,
      returnDate,
      customerName: f.name.trim(),
      customerContact: f.contact.trim(),
      notes: [f.occasion.trim(), f.notes.trim()].filter(Boolean).join(" · "),
    });
    try {
      window.sessionStorage.removeItem(KEY(gown.slug));
    } catch {
      /* ignore */
    }
    router.push(`${CGR_BASE}/confirmation?ref=${encodeURIComponent(booking.ref)}`);
  }

  const errList = Object.values(errors).filter(Boolean);
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setF((p) => ({ ...p, [k]: v }));
    if (k === "name" || k === "contact") setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const heads: Record<Step, { t: React.ReactNode; s: string }> = {
    1: {
      t: (
        <>
          When is the <em>event?</em>
        </>
      ),
      s: "Your dates came over from the gown page. To change them, pick again on the gown’s calendar.",
    },
    2: {
      t: (
        <>
          Who should the shop <em>message?</em>
        </>
      ),
      s: "A name and a number or Messenger is all the shop needs to confirm.",
    },
    3: {
      t: (
        <>
          Tell us about the <em>occasion.</em>
        </>
      ),
      s: "Optional, but it helps the shop prepare the fitting.",
    },
  };

  return (
    <div className="cgr-bk ox grain">
      <div className="cgr-bk-in">
        <div className="cgr-bk-grid">
          <aside className="cgr-bk-side" aria-label="Your reservation">
            <div className="cgr-bk-photo dark">
              <img src={`${CGR_ASSET}/${img.file}.webp`} alt="" width={img.w} height={img.h} decoding="async" />
            </div>
            <div className="cgr-hold">
              <div className="cgr-hold-top">
                <p className="cgr-hold-t">Your reservation</p>
                <p className="cgr-hold-s">{gown.name}</p>
              </div>
              <p className="cgr-hold-mini">
                <span>{range || "–"}</span>
                <span className="cgr-hold-mini-t">{total !== null ? formatPhp(total) : "–"}</span>
              </p>
              <dl className="cgr-hold-dl">
                <div>
                  <dt>Pickup</dt>
                  <dd>{eventDate ? humanDate(eventDate) : "–"}</dd>
                </div>
                <div>
                  <dt>Return</dt>
                  <dd>{returnDate ? humanDate(returnDate) : "–"}</dd>
                </div>
                <div>
                  <dt>Example rate</dt>
                  <dd>{formatPhp(gown.pricePerDay)} / day</dd>
                </div>
                <div>
                  <dt>
                    Total, {days ?? "–"} {days === 1 ? "day" : "days"}
                  </dt>
                  <dd data-total={total ?? ""}>{total !== null ? formatPhp(total) : "–"}</dd>
                </div>
                <div>
                  <dt>Reference</dt>
                  <dd className="cgr-hold-pend">after step 03</dd>
                </div>
              </dl>
              <p className="cgr-hold-n">A reservation request, not a payment. Example rates.</p>
            </div>
          </aside>

          <form className="cgr-form" onSubmit={onSubmit} noValidate aria-label={`Reserve the ${gown.name}`}>
            <div className="cgr-step-in" key={step}>
              <StepHead n={step} title={heads[step].t} sub={heads[step].s} headRef={headRef} />

              {step === 1 ? (
                <fieldset className="cgr-fs">
                  <legend className="sr-only">Your dates</legend>
                  <div className="uf-row">
                    <div className="uf uf-ro">
                      <span className="uf-l">Pickup (event day)</span>
                      <span className="uf-v">{eventDate ? `${humanDate(eventDate)} ${eventDate.slice(0, 4)}` : "–"}</span>
                    </div>
                    <div className="uf uf-ro">
                      <span className="uf-l">Return</span>
                      <span className="uf-v">{returnDate ? `${humanDate(returnDate)} ${returnDate.slice(0, 4)}` : "–"}</span>
                    </div>
                  </div>
                  <div className="cgr-bk-okrow">
                    <p className={datesOk ? "cgr-bk-ok" : "cgr-bk-ok is-no"} role="status" id={`${uid}-dates`}>
                      {dateStatus}
                    </p>
                    <Link className="ulink" href={changeHref}>
                      Change<span className="sr-only"> the dates on the gown page</span>
                    </Link>
                  </div>
                </fieldset>
              ) : null}

              {step === 2 ? (
                <fieldset className="cgr-fs">
                  <legend className="sr-only">About you</legend>
                  <label className="uf">
                    <span className="uf-l">Your name</span>
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Mavy Dela Cruz"
                      value={f.name}
                      onChange={set("name")}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? `${uid}-en` : undefined}
                      required
                    />
                    {errors.name ? (
                      <span className="uf-err" id={`${uid}-en`}>
                        {errors.name}
                      </span>
                    ) : null}
                  </label>
                  <label className="uf">
                    <span className="uf-l">Mobile or Messenger</span>
                    <input
                      type="text"
                      autoComplete="tel"
                      inputMode="text"
                      placeholder="0917 000 0000"
                      value={f.contact}
                      onChange={set("contact")}
                      aria-invalid={errors.contact ? true : undefined}
                      aria-describedby={`${uid}-hc${errors.contact ? ` ${uid}-ec` : ""}`}
                      required
                    />
                    <span className="uf-h" id={`${uid}-hc`}>
                      The shop texts or messages you here to confirm.
                    </span>
                    {errors.contact ? (
                      <span className="uf-err" id={`${uid}-ec`}>
                        {errors.contact}
                      </span>
                    ) : null}
                  </label>
                </fieldset>
              ) : null}

              {step === 3 ? (
                <fieldset className="cgr-fs">
                  <legend className="sr-only">The occasion</legend>
                  <label className="uf">
                    <span className="uf-l">The occasion</span>
                    <input type="text" placeholder="Debut, 7 Nov in Imus" value={f.occasion} onChange={set("occasion")} aria-describedby={`${uid}-ho`} />
                    <span className="uf-h" id={`${uid}-ho`}>
                      Optional
                    </span>
                  </label>
                  <label className="uf">
                    <span className="uf-l">Anything the shop should know</span>
                    <input type="text" placeholder="Needs hemming for 5′2″" value={f.notes} onChange={set("notes")} aria-describedby={`${uid}-hn`} />
                    <span className="uf-h" id={`${uid}-hn`}>
                      Optional
                    </span>
                  </label>
                  <dl className="cgr-rev">
                    <div>
                      <dt>Dates</dt>
                      <dd>{range || "–"}</dd>
                      <Link className="ulink" href={changeHref}>
                        Change<span className="sr-only"> the dates</span>
                      </Link>
                    </div>
                    <div>
                      <dt>Name</dt>
                      <dd>{f.name.trim() || "–"}</dd>
                      <button type="button" className="ulink" onClick={() => go(2, true)}>
                        Change<span className="sr-only"> your name</span>
                      </button>
                    </div>
                    <div>
                      <dt>Contact</dt>
                      <dd>{f.contact.trim() || "–"}</dd>
                      <button type="button" className="ulink" onClick={() => go(2, true)}>
                        Change<span className="sr-only"> your contact</span>
                      </button>
                    </div>
                  </dl>
                </fieldset>
              ) : null}

              {errList.length ? (
                <div className="cgr-bk-err" role="alert">
                  {errList.map((m) => (
                    <p key={m}>{m}</p>
                  ))}
                </div>
              ) : null}

              <div className="cgr-bk-actions">
                <button type="submit" className="btn btn-cream">
                  {step === 3 ? (
                    "Reserve your gown"
                  ) : (
                    <>
                      Continue <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>
                {step === 1 ? (
                  <Link className="ulink" href={gownHref}>
                    Back to the gown
                  </Link>
                ) : (
                  <button type="button" className="ulink" onClick={() => go((step - 1) as Step, true)}>
                    Back
                  </button>
                )}
              </div>
              {step === 3 ? (
                <p className="cgr-bk-note">
                  This sample saves the request in your browser with a CGR reference. Nothing is sent to the shop, and
                  nothing is paid.
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
