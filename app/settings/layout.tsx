import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import SettingsTabs from "@/components/SettingsForm/SettingsTabs";
import "./settings.css";

export const metadata: Metadata = {
  title: "Settings",
};

// Alles onder /settings is per request beveiligd (auth-gate leest cookies).
export const dynamic = "force-dynamic";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="settings">
      <header className="settings__head">
        <div>
          <span className="settings__eyebrow">Account</span>
          <h1 className="settings__title">Settings</h1>
        </div>
        <span className="pill pill-surface">Signed in as {user.username}</span>
      </header>

      <SettingsTabs />

      <div className="settings__body">{children}</div>
    </div>
  );
}
