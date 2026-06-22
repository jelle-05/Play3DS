"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  updateProfile,
  type SettingsState,
} from "@/app/settings/actions";
import type { EditableProfile, TrackedGameOption } from "@/lib/profiles";
import { gradientForSlug } from "@/lib/games";

const BIO_MAX = 280;
const initialState: SettingsState = { ok: false };

function initialsFrom(name: string): string {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") return "P3";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="settings-btn settings-btn--primary" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

interface Props {
  profile: EditableProfile;
  trackedGames: TrackedGameOption[];
}

export default function ProfileSettingsForm({ profile, trackedGames }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    async (prev: SettingsState, formData: FormData) => {
      const result = await updateProfile(prev, formData);
      if (result.ok) router.refresh();
      return result;
    },
    initialState
  );

  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");

  return (
    <form action={formAction} className="settings-form">
      <div className="settings-form__intro">
        <h2 className="settings-form__title">Public profile</h2>
        <p className="settings-form__sub">
          This is how others see you across Play3DS.
        </p>
      </div>

      {/* Avatar preview + URL */}
      <div className="settings-avatar">
        <div className={`settings-avatar__preview ${gradientForSlug(username || "player")}`}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="settings-avatar__img"
              src={avatarUrl}
              alt="Avatar preview"
            />
          ) : (
            <span aria-hidden="true">{initialsFrom(username || "P3")}</span>
          )}
        </div>
        <label className="settings-field settings-avatar__field">
          <span className="settings-field__label">Avatar URL</span>
          <input
            name="avatar_url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="settings-field__input"
            placeholder="https://…"
            maxLength={500}
            inputMode="url"
          />
          <span className="settings-field__hint">
            Link to an image. Leave empty to use your initials.
          </span>
        </label>
      </div>

      <label className="settings-field">
        <span className="settings-field__label">Username *</span>
        <input
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="settings-field__input"
          required
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]+"
          placeholder="player_one"
        />
        <span className="settings-field__hint">
          3–20 characters · letters, numbers and underscores. Changing this
          changes your profile link.
        </span>
      </label>

      <label className="settings-field">
        <span className="settings-field__label">Bio</span>
        <textarea
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
          className="settings-field__input settings-field__textarea"
          rows={3}
          maxLength={BIO_MAX}
          placeholder="A few words about you and your 3DS taste…"
        />
        <span className="settings-field__hint settings-field__count">
          {bio.length}/{BIO_MAX}
        </span>
      </label>

      <div className="settings-form__row">
        <label className="settings-field">
          <span className="settings-field__label">Country / region</span>
          <input
            name="country"
            defaultValue={profile.country ?? ""}
            className="settings-field__input"
            maxLength={56}
            placeholder="Netherlands"
          />
        </label>

        <label className="settings-field">
          <span className="settings-field__label">Favorite game</span>
          <select
            name="favorite_game_id"
            defaultValue={profile.favoriteGameId ?? ""}
            className="settings-field__input"
            disabled={trackedGames.length === 0}
          >
            <option value="">— None —</option>
            {trackedGames.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          <span className="settings-field__hint">
            {trackedGames.length === 0
              ? "Track a game first to pick a favorite."
              : "Pick from the games you track."}
          </span>
        </label>
      </div>

      {state.error && (
        <p className="settings-feedback settings-feedback--error" role="alert">
          {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p className="settings-feedback settings-feedback--ok" role="status">
          {state.message}
        </p>
      )}

      <div className="settings-form__actions">
        <SaveButton />
      </div>
    </form>
  );
}
