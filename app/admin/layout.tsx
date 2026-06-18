import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
};

// Alles onder /admin is per request beveiligd (role-gate leest cookies).
export const dynamic = "force-dynamic";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/games", label: "Games" },
  { href: "/admin/import", label: "Import" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  return (
    <div className="admin">
      <header className="admin__head">
        <div>
          <span className="admin__eyebrow">Admin</span>
          <h1 className="admin__title">Play3DS console</h1>
        </div>
        <span className="pill pill-surface">Signed in as {user.username}</span>
      </header>

      <nav className="admin__tabs" aria-label="Admin sections">
        {TABS.map((tab) => (
          <Link key={tab.href} href={tab.href} className="admin__tab">
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="admin__body">{children}</div>
    </div>
  );
}
