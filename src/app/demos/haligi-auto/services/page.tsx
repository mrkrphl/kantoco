import { FadeUp } from "@/components/demos/FadeUp";
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
      <div className="px-4 py-10 md:px-6 md:py-14">
        <FadeUp>
          <h1 className="haligi-cond text-5xl text-[var(--ha-yellow)] md:text-7xl">
            Work order
          </h1>
          <p className="mt-3 max-w-lg text-sm text-[var(--ha-steel)]">
            Sample rates for this demo. A live shop writes their own board.
          </p>
        </FadeUp>

        <div className="haligi-stamp mt-10 bg-[var(--ha-black)] p-4 md:p-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="haligi-cond text-xl text-[var(--ha-yellow)]">
                <th className="pb-3">Job</th>
                <th className="pb-3">Note</th>
                <th className="pb-3">Guide</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([job, note, price]) => (
                <tr key={job} className="border-t border-white/10">
                  <td className="haligi-cond py-3 text-xl">{job}</td>
                  <td className="py-3 text-[var(--ha-steel)]">{note}</td>
                  <td className="py-3 text-[var(--ha-yellow)]">{price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="haligi-cond mt-8 inline-block bg-[var(--ha-yellow)] px-5 py-3 text-xl text-[var(--ha-black)]"
        >
          Ask KantoCo for a bay site
        </a>
      </div>
    </HaligiShell>
  );
}
