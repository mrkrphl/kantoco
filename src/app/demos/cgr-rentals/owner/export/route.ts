import { COMMISSION_PHP } from "@/lib/cgr-rentals";
import { loadOwnerData, ownerSession, OWNER_DB_ON, type OwnerRow } from "@/lib/cgr-supabase";

export const dynamic = "force-dynamic";

const PRIVATE = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const COUNTS = new Set(["confirmed", "out", "returned"]);

/** Quote every cell; a leading = + - @ is defused so spreadsheets don't run it. */
function cell(v: string | number): string {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function manilaStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${g("year")}-${g("month")}-${g("day")} ${g("hour")}:${g("minute")}`;
}

const HEAD = [
  "type",
  "ref",
  "status",
  "gown",
  "event_date",
  "return_date",
  "fitting_date",
  "fitting_time",
  "for_reservation",
  "customer_name",
  "customer_contact",
  "notes",
  "created_pht",
  "commission_php",
];

function line(r: OwnerRow): string {
  const counts = r.kind === "reserve" && COUNTS.has(r.status);
  return [
    r.kind === "fitting" ? "fitting" : "reservation",
    r.ref,
    r.status,
    r.gownName,
    r.kind === "reserve" ? r.eventDate : "",
    r.returnDate,
    r.fittingDate ?? "",
    r.slot ?? "",
    r.linkedRef ?? "",
    r.customerName,
    r.customerContact,
    r.notes,
    manilaStamp(r.createdAt),
    counts ? COMMISSION_PHP : 0,
  ]
    .map(cell)
    .join(",");
}

export async function GET() {
  if (!OWNER_DB_ON) {
    return new Response("Owner sign-in isn't set up on this site.", { status: 404, headers: PRIVATE });
  }
  const s = await ownerSession();
  if (s.state === "unavailable") return new Response("Bookings are resting for a moment.", { status: 503, headers: PRIVATE });
  if (s.state !== "owner") return new Response("Owners only.", { status: 403, headers: PRIVATE });
  const data = await loadOwnerData(s.sb);
  if (!data) return new Response("Bookings are resting for a moment.", { status: 503, headers: PRIVATE });
  const rows = [...data.rows].sort(
    (a, b) => (a.fittingDate ?? a.eventDate).localeCompare(b.fittingDate ?? b.eventDate) || a.ref.localeCompare(b.ref),
  );
  const today = manilaStamp(new Date().toISOString()).slice(0, 10);
  const body = "\uFEFF" + [HEAD.map(cell).join(","), ...rows.map(line)].join("\r\n") + "\r\n";
  return new Response(body, {
    headers: {
      ...PRIVATE,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cgr-bookings-${today}.csv"`,
    },
  });
}
