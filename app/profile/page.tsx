import { redirect } from "next/navigation";
import { getOwnUsername } from "@/lib/profiles";

export const dynamic = "force-dynamic";

// "Profile" in de nav verwijst naar het eigen publieke profiel. Niet ingelogd →
// naar login. Geen profiel-rij (zou niet mogen) → dashboard als veilige val.
export default async function ProfileRedirect() {
  const username = await getOwnUsername();
  if (!username) redirect("/login");
  redirect(`/users/${encodeURIComponent(username)}`);
}
