import Link from "next/link";
import IgdbSync from "@/components/admin/IgdbSync";
import { isIgdbConfigured } from "@/lib/igdb";

export default function IgdbPage() {
  return (
    <div className="admin-edit">
      <Link href="/admin/games" className="admin-back">
        ← Back to games
      </Link>
      <h2 className="admin-section-title">IGDB catalog sync</h2>
      <p className="admin-field__hint admin-import__intro">
        Pulls the full Nintendo 3DS catalog from IGDB (title, year, genre,
        developer, publisher, cover and summary) and time-to-beat estimates. Games
        are upserted on their slug, so re-running is safe and never duplicates.
      </p>

      {isIgdbConfigured ? (
        <IgdbSync />
      ) : (
        <div className="admin-alert admin-alert--warn">
          <strong>IGDB is not configured.</strong> Add the environment variables{" "}
          <code>IGDB_CLIENT_ID</code> and <code>IGDB_CLIENT_SECRET</code> in the Vercel
          project settings (from a free Twitch developer application), then redeploy.
          See <code>SETUP.md</code> for the step-by-step.
        </div>
      )}
    </div>
  );
}
