import { FadeUp } from "@/components/demos/FadeUp";
import { NaraShell } from "@/components/demos/nara/NaraShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

const rows = [
  ["General consult", "Walk-in or same-morning slot.", "From ₱450"],
  ["Follow-up visit", "Within 7 days of last chart.", "From ₱250"],
  ["Wound cleaning", "Dressing change included.", "From ₱350"],
  ["BP reading", "Written result. No app login.", "₱80"],
  ["Capillary sugar", "Fingerstick. Result on paper.", "₱100"],
  ["Nebulization", "In-clinic only. Sit until done.", "From ₱200"],
  ["School / work clearance", "If the exam supports it.", "From ₱400"],
  ["Injection (prescribed)", "Bring the vial or the script.", "From ₱150"],
];

export default function NaraServices() {
  return (
    <NaraShell current="Services">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <FadeUp>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--nara-green)]">
            Services
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Posted rates. No package fog.
          </h1>
          <p className="mt-4 max-w-lg text-[var(--nara-muted)]">
            Sample prices for this demo. A live clinic would lock these to their
            own chart.
          </p>
        </FadeUp>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-[var(--nara-green)]">
                <th className="py-3 font-semibold">Visit</th>
                <th className="py-3 font-semibold">Note</th>
                <th className="py-3 font-semibold">Guide</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([visit, note, price]) => (
                <tr key={visit} className="nara-ledger">
                  <td className="py-3 font-semibold">{visit}</td>
                  <td className="py-3 text-[var(--nara-muted)]">{note}</td>
                  <td className="py-3">{price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex bg-[var(--nara-rust)] px-4 py-3 text-sm font-semibold text-[var(--nara-paper)]"
        >
          Ask about a live clinic site
        </a>
      </div>
    </NaraShell>
  );
}
