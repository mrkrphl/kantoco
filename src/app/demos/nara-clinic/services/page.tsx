import { NaraShell } from "@/components/demos/nara/NaraShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

const rows = [
  ["General consult", "Same-morning slot if a chair is free.", "From ₱450"],
  ["Follow-up visit", "Within 7 days of last chart.", "From ₱250"],
  ["Wound cleaning", "Dressing change included.", "From ₱350"],
  ["BP reading", "Written result, with no app login.", "₱80"],
  ["Capillary sugar", "Fingerstick, with the result on paper.", "₱100"],
  ["Nebulization", "In-clinic only. Sit until done.", "From ₱200"],
  ["School / work clearance", "If the exam supports it.", "From ₱400"],
  ["Injection (prescribed)", "Bring the vial or the script.", "From ₱150"],
];

export default function NaraServices() {
  return (
    <NaraShell current="Services">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--nara-green)]">
          Services
        </p>
        <h1 className="nara-serif mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Posted rates for this sample clinic.
        </h1>
        <p className="mt-4 max-w-lg text-[var(--nara-muted)]">
          A live clinic would lock these numbers to their own chart. The list is
          here so a shop owner can see a clear ledger instead of a fog of
          packages.
        </p>

        <div className="mt-10 overflow-x-auto">
          <table className="nara-table min-w-[32rem] text-sm">
            <thead>
              <tr>
                <th>Visit</th>
                <th>Note</th>
                <th>Guide</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([visit, note, price]) => (
                <tr key={visit}>
                  <td className="font-semibold">{visit}</td>
                  <td className="text-[var(--nara-muted)]">{note}</td>
                  <td>{price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex bg-[var(--nara-maroon)] px-4 py-3 text-sm font-semibold text-[#f7fbf8]"
        >
          Message us on Facebook
        </a>
      </div>
    </NaraShell>
  );
}
