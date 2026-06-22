import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// /settings → de eerste tab.
export default function SettingsIndex() {
  redirect("/settings/profile");
}
