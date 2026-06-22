import { redirect } from "next/navigation";
import { getOwnProfile, getOwnTrackedGames } from "@/lib/profiles";
import ProfileSettingsForm from "@/components/SettingsForm/ProfileSettingsForm";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const profile = await getOwnProfile();
  // Geen profiel-rij betekent niet ingelogd (de layout vangt dat normaal al af).
  if (!profile) redirect("/login");

  const trackedGames = await getOwnTrackedGames();

  return <ProfileSettingsForm profile={profile} trackedGames={trackedGames} />;
}
