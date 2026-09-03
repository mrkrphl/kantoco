import { HaligiShell } from "@/components/demos/haligi/HaligiShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";

const rows = [
  ["Oil + filter", "Semi-synth or full. Drain plug torque noted.", "from ₱1,800"],
  ["Brake pads (axle)", "Hardware included if the clip is shot.", "from ₱2,400"],
  ["Tire mount / pair", "Balance included. TPMS reset if it takes.", "from ₱800"],
  ["Wheel align", "Printout if the rack is free.", "₱1,200"],
  ["A/C diagnose", "Dye or electronic. Charge is extra.", "₱700"],
  ["Battery test", "Load test. We do not guess by crank sound.", "₱200"],
  ["Scan + talk", "Code read, then we say what is real.", "₱400"],
];

export default function HaligiServices() {
  return (
    <HaligiShell current="Services">
      <div className="haligi-page pb-16">
        <h1 className="haligi-cond haligi-title">Work order</h1>
        <p className="mt-3 max-w-lg text-[var(--mute)]">
          Sample rates for this demo. A live shop writes their own board.
        </p>

        <div className="haligi-form mt-10 overflow-x-auto p-5 md:p-7">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="haligi-cond text-xl">
                <th className="pb-3">Job</th>
                <th className="pb-3">Note</th>
                <th className="pb-3">Guide</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([job, note, price]) => (
                <tr key={job} className="border-t border-[var(--rule)]">
                  <td className="haligi-cond py-4 text-xl">{job}</td>
                  <td className="py-4 text-[var(--mute)]">{note}</td>
                  <td className="py-4 text-[var(--accent)]">{price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="haligi-cta"
        >
          Message us on Facebook
        </a>
      </div>
    </HaligiShell>
  );
}
