import Link from "next/link";
import { CGR_BASE } from "@/lib/cgr-rentals";
import { SignOutButton } from "@/components/demos/cgr-rentals/OwnerAuth";

/**
 * r8.4b plain owner area frame (design-r8.4b): a white top bar with the
 * brand, "Owner view | Admin" (Admin only for admins, D8) and Sign out, then
 * one 640px column. Everything sits inside .cgr-plain (plain.css), so the
 * public pages never get these styles.
 */
export function PlainShell({
  page,
  current,
  admin = false,
  signedIn = false,
  children,
}: {
  page: string;
  current?: "owner" | "admin";
  admin?: boolean;
  signedIn?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="cgr-plain" data-plain={page}>
      <header className="bar">
        <div className="in">
          <Link className="brand" href={`${CGR_BASE}/owner`} aria-label="CGR Rentals">
            <span className="long">CGR Rentals</span>
            <span className="short">CGR</span>
          </Link>
          {signedIn && current ? (
            <nav aria-label="Owner area">
              <Link href={`${CGR_BASE}/owner`} aria-current={current === "owner" ? "page" : undefined}>
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
    </div>
  );
}
