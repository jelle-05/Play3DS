import Link from "next/link";
import { notFound } from "next/navigation";
import GameForm from "@/components/admin/GameForm";
import { getAdminGameById, getAliasesForGame } from "@/lib/admin";
import { updateGame, deleteGame, addAlias, deleteAlias } from "@/app/admin/actions";

interface EditGamePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditGamePage({ params, searchParams }: EditGamePageProps) {
  const { id } = await params;
  const { error } = await searchParams;

  const game = await getAdminGameById(id);
  if (!game) notFound();

  const aliases = await getAliasesForGame(id);

  return (
    <div className="admin-edit">
      <Link href="/admin/games" className="admin-back">
        ← Back to games
      </Link>
      <h2 className="admin-section-title">Edit “{game.title}”</h2>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      <GameForm action={updateGame} game={game} submitLabel="Save changes" />

      {/* Aliases */}
      <section className="admin-aliases">
        <h3 className="admin-subsection-title">Aliases</h3>
        <p className="admin-field__hint">
          Alternative or regional titles. Used by search so duplicates stay merged.
        </p>

        {aliases.length > 0 ? (
          <ul className="admin-alias-list">
            {aliases.map((a) => (
              <li key={a.id} className="admin-alias">
                <span className="admin-alias__name">{a.alias}</span>
                {a.region && <span className="admin-alias__region">{a.region}</span>}
                <form action={deleteAlias} className="admin-alias__del">
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="game_id" value={game.id} />
                  <button type="submit" className="admin-btn admin-btn--sm admin-btn--danger">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-note">No aliases yet.</p>
        )}

        <form action={addAlias} className="admin-alias-add">
          <input type="hidden" name="game_id" value={game.id} />
          <input
            name="alias"
            required
            placeholder="Alternative title"
            className="admin-field__input"
          />
          <input
            name="region"
            placeholder="Region (optional)"
            className="admin-field__input admin-alias-add__region"
          />
          <button type="submit" className="admin-btn">
            Add alias
          </button>
        </form>
      </section>

      {/* Danger zone */}
      <section className="admin-danger">
        <h3 className="admin-subsection-title">Danger zone</h3>
        <form action={deleteGame}>
          <input type="hidden" name="id" value={game.id} />
          <button type="submit" className="admin-btn admin-btn--danger">
            Delete game
          </button>
        </form>
      </section>
    </div>
  );
}
