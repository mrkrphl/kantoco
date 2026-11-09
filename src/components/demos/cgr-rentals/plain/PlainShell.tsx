import Link from "next/link";
import { CGR_BASE } from "@/lib/cgr-rentals";
import { SignOutButton } from "@/components/demos/cgr-rentals/OwnerAuth";

export type OwnerTab = "today" | "bookings" | "catalogue" | "times" | "admin";

/**
 * r8.4b plain owner frame, r9 bottom tabs on phone: Today, Bookings,
 * Catalogue, Fitting times. Admin stays in the top bar for admins only (D8).
 */
export function PlainShell({
  page,
  current,
  admin = false,
  signedIn = false,
  children,
}: {
  page: string;
  current?: OwnerTab;
  admin?: boolean;
  signedIn?: boolean;
  children: React.ReactNode;
}) {
  const tabs: { id: OwnerTab; href: string; label: string }[] = [
    { id: "today", href: `${CGR_BASE}/owner`, label: "Today" },
    { id: "bookings", href: `${CGR_BASE}/owner/bookings`, label: "Bookings" },
    { id: "catalogue", href: `${CGR_BASE}/owner/catalogue`, label: "Catalogue" },
    { id: "times", href: `${CGR_BASE}/owner/times`, label: "Fitting times" },
  ];
  return (
    <div className="cgr-plain" data-plain={page}>
      <header className="bar">
        <div className="in">
          <Link className="brand" href={`${CGR_BASE}/owner`} aria-label="CGR Rentals">
            <span className="long">CGR Rentals</span>
            <span className="short">CGR</span>
          </Link>
          {signedIn && current ? (
            <nav className="topnav" aria-label="Owner area">
              <Link href={`${CGR_BASE}/owner`} aria-current={current === "today" ? "page" : undefined}>
                Owner view
              </Link>
              {admin ? (
                <Link href={`${CGR_BASE}/admin`} aria-current={current === "admin" ? "page" : undefined}>
                  Admin
                </Link>
              ) : null}
            </nav>
          ) : null}
          {signedIn ? <SignOutButton /> : null}
        </div>
      </header>
      <main className="pg">{children}</main>
      {signedIn && current && current !== "admin" ? (
        <nav className="tabs" aria-label="Owner sections">
          {tabs.map((t) => (
            <Link key={t.id} href={t.href} aria-current={current === t.id ? "page" : undefined} className="tab">
              {t.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
