"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { updatePrivacy, type SettingsState } from "@/app/settings/actions";

const initialState: SettingsState = { ok: false };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="settings-btn settings-btn--primary" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export default function PrivacySettingsForm({
  visibility,
}: {
  visibility: "public" | "private";
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    async (prev: SettingsState, formData: FormData) => {
      const result = await updatePrivacy(prev, formData);
      if (result.ok) router.refresh();
      return result;
    },
    initialState
  );
  const [value, setValue] = useState<"public" | "private">(visibility);

  return (
    <form action={formAction} className="settings-form">
      <div className="settings-form__intro">
        <h2 className="settings-form__title">Privacy</h2>
        <p className="settings-form__sub">
          Control who can see your profile, library and reviews.
        </p>
      </div>

      <fieldset className="settings-choices">
        <legend className="settings-field__label">Profile visibility</legend>

        <label
          className={`settings-choice${value === "public" ? " settings-choice--active" : ""}`}
        >
          <input
            type="radio"
            name="visibility"
            value="public"
            checked={value === "public"}
            onChange={() => setValue("public")}
          />
          <span className="settings-choice__body">
            <span className="settings-choice__title">🌍 Public</span>
            <span className="settings-choice__desc">
              Anyone can view your profile and your public playthroughs and
              reviews.
            </span>
          </span>
        </label>

        <label
          className={`settings-choice${value === "private" ? " settings-choice--active" : ""}`}
        >
          <input
            type="radio"
            name="visibility"
            value="private"
            checked={value === "private"}
            onChange={() => setValue("private")}
          />
          <span className="settings-choice__body">
            <span className="settings-choice__title">🔒 Private</span>
            <span className="settings-choice__desc">
              Your profile is hidden from others. Only you can see it when
              logged in.
            </span>
          </span>
        </label>
      </fieldset>

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
