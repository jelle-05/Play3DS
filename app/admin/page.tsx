import Link from "next/link";
import { getAdminGames } from "@/lib/admin";

export default async function AdminHome() {
  const games = await getAdminGames();
  const byStatus = {
    basic: games.filter((g) => g.metadata_status === "basic").length,
    enriched: games.filter((g) => g.metadata_status === "enriched").length,
    verified: games.filter((g) => g.metadata_status === "verified").length,
  };

  return (
    <div className="admin-overview">
      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat__num">{games.length}</span>
          <span className="admin-stat__label">Games total</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__num">{byStatus.basic}</span>
          <span className="admin-stat__label">Basic</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__num">{byStatus.enriched}</span>
          <span className="admin-stat__label">Enriched</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__num">{byStatus.verified}</span>
          <span className="admin-stat__label">Verified</span>
        </div>
      </div>

      <div className="admin-quick">
        <Link href="/admin/games/new" className="admin-btn admin-btn--primary">
          + Add game
        </Link>
        <Link href="/admin/games" className="admin-btn">
          Manage games
        </Link>
        <Link href="/admin/import" className="admin-btn">
          Import CSV
        </Link>
      </div>

      <p className="admin-note">
        Reviews, comments, users and metrics management arrive in later phases.
      </p>
    </div>
  );
}
