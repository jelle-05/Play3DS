import { redirect } from "next/navigation";
import { getOwnProfile } from "@/lib/profiles";
import PrivacySettingsForm from "@/components/SettingsForm/PrivacySettingsForm";

export const dynamic = "force-dynamic";

export default async function PrivacySettingsPage() {
  const profile = await getOwnProfile();
  if (!profile) redirect("/login");

  return <PrivacySettingsForm visibility={profile.visibility} />;
}
