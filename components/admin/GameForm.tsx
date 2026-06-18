import type { AdminGameRow } from "@/lib/admin";

interface GameFormProps {
  action: (formData: FormData) => void;
  game?: AdminGameRow;
  submitLabel: string;
}

const STATUSES = ["basic", "enriched", "verified"] as const;

// Gedeeld game-formulier voor /admin/games/new en /admin/games/[id].
// Server component dat post naar een server action (geen client-JS nodig).
export default function GameForm({ action, game, submitLabel }: GameFormProps) {
  return (
    <form action={action} className="admin-form">
      {game && <input type="hidden" name="id" value={game.id} />}

      <div className="admin-form__grid">
        <label className="admin-field admin-field--wide">
          <span className="admin-field__label">Title *</span>
          <input
            name="title"
            required
            defaultValue={game?.title ?? ""}
            className="admin-field__input"
            placeholder="Pokémon X"
          />
        </label>

        <label className="admin-field">
          <span className="admin-field__label">Slug</span>
          <input
            name="slug"
            defaultValue={game?.slug ?? ""}
            className="admin-field__input"
            placeholder="auto from title"
          />
          <span className="admin-field__hint">Leave empty to derive from title.</span>
        </label>

        <label className="admin-field">
          <span className="admin-field__label">Platform</span>
          <input
            name="platform"
            defaultValue={game?.platform ?? "Nintendo 3DS"}
            className="admin-field__input"
          />
        </label>

        <label className="admin-field">
          <span className="admin-field__label">Release year</span>
          <input
            name="release_year"
            type="number"
            inputMode="numeric"
            defaultValue={game?.release_year ?? ""}
            className="admin-field__input"
            placeholder="2013"
          />
        </label>

        <label className="admin-field">
          <span className="admin-field__label">Genre</span>
          <input
            name="genre"
            defaultValue={game?.genre ?? ""}
            className="admin-field__input"
            placeholder="RPG"
          />
        </label>

        <label className="admin-field">
          <span className="admin-field__label">Developer</span>
          <input
            name="developer"
            defaultValue={game?.developer ?? ""}
            className="admin-field__input"
          />
        </label>

        <label className="admin-field">
          <span className="admin-field__label">Publisher</span>
          <input
            name="publisher"
            defaultValue={game?.publisher ?? ""}
            className="admin-field__input"
          />
        </label>

        <label className="admin-field">
          <span className="admin-field__label">Metadata status</span>
          <select
            name="metadata_status"
            defaultValue={game?.metadata_status ?? "basic"}
            className="admin-field__input"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field admin-field--wide">
          <span className="admin-field__label">Cover URL</span>
          <input
            name="cover_url"
            defaultValue={game?.cover_url ?? ""}
            className="admin-field__input"
            placeholder="https://…"
          />
        </label>

        <label className="admin-field admin-field--wide">
          <span className="admin-field__label">Description</span>
          <textarea
            name="description"
            defaultValue={game?.description ?? ""}
            className="admin-field__input admin-field__textarea"
            rows={4}
          />
        </label>
      </div>

      <div className="admin-form__actions">
        <button type="submit" className="admin-btn admin-btn--primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
