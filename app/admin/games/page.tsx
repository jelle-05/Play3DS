import Link from "next/link";
import { getAdminGames } from "@/lib/admin";

export default async function AdminGamesPage() {
  const games = await getAdminGames();

  return (
    <div className="admin-games">
      <div className="admin-games__bar">
        <p className="admin-games__count">{games.length} games</p>
        <div className="admin-quick">
          <Link href="/admin/import" className="admin-btn">
            Import CSV
          </Link>
          <Link href="/admin/games/new" className="admin-btn admin-btn--primary">
            + Add game
          </Link>
        </div>
      </div>

      {games.length === 0 ? (
        <p className="admin-note">No games yet. Add one or import a CSV.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Year</th>
                <th>Genre</th>
                <th>Status</th>
                <th aria-label="Edit" />
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td>
                    <span className="admin-table__title">{game.title}</span>
                    <span className="admin-table__slug">{game.slug}</span>
                  </td>
                  <td>{game.release_year ?? "—"}</td>
                  <td>{game.genre ?? "—"}</td>
                  <td>
                    <span className={`admin-tag admin-tag--${game.metadata_status}`}>
                      {game.metadata_status}
                    </span>
                  </td>
                  <td className="admin-table__action">
                    <Link href={`/admin/games/${game.id}`} className="admin-btn admin-btn--sm">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
