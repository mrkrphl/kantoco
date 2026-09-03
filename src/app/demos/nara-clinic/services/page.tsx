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
      <div className="nara-page pb-16">
        <p className="nara-kicker">Services</p>
        <h1 className="nara-serif nara-title">
          Posted rates for this sample clinic.
        </h1>
        <p className="nara-lede">
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
                  <td className="text-[var(--mute)]">{note}</td>
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
          className="nara-cta"
        >
          Message us on Facebook
        </a>
      </div>
    </NaraShell>
  );
}
