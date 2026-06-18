"use client";

import { useActionState, useRef, useState } from "react";
import { importGamesCsv, type ImportResult } from "@/app/admin/actions";

const INITIAL: ImportResult = { ok: false, created: 0, updated: 0, total: 0, errors: [] };

const EXAMPLE = `title,slug,release_year,genre,developer,publisher,metadata_status,aliases
Professor Layton and the Miracle Mask,,2011,Puzzle,Level-5,Nintendo,enriched,Professor Layton en het Masker der Wonderen|Professor Layton and the Mask of Miracle
Luigi's Mansion: Dark Moon,,2013,Action,Next Level Games,Nintendo,basic,Luigi's Mansion 2`;

export default function ImportForm() {
  const [state, formAction, pending] = useActionState(importGamesCsv, INITIAL);
  const [csv, setCsv] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  return (
    <div className="admin-import">
      <form action={formAction} className="admin-import__form">
        <div className="admin-import__toolbar">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onFile}
            className="admin-import__file"
          />
          <button
            type="button"
            className="admin-btn admin-btn--sm"
            onClick={() => setCsv(EXAMPLE)}
          >
            Load example
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--sm"
            onClick={() => {
              setCsv("");
              if (fileRef.current) fileRef.current.value = "";
            }}
          >
            Clear
          </button>
        </div>

        <textarea
          name="csv"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={12}
          spellCheck={false}
          placeholder="Paste CSV here (first row = headers)…"
          className="admin-field__input admin-import__textarea"
        />

        <p className="admin-field__hint">
          Columns: <code>title</code> (required), <code>slug</code>, <code>platform</code>,{" "}
          <code>release_year</code>, <code>genre</code>, <code>developer</code>,{" "}
          <code>publisher</code>, <code>cover_url</code>, <code>description</code>,{" "}
          <code>metadata_status</code>, <code>aliases</code> (pipe-separated). Rows
          upsert on slug.
        </p>

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={pending}>
            {pending ? "Importing…" : "Import games"}
          </button>
        </div>
      </form>

      {state.message && (
        <div
          className={`admin-alert ${
            state.ok ? "admin-alert--success" : "admin-alert--warn"
          }`}
        >
          {state.message}
        </div>
      )}

      {state.errors.length > 0 && (
        <div className="admin-import__errors">
          <h3 className="admin-subsection-title">Skipped rows</h3>
          <ul>
            {state.errors.map((err, i) => (
              <li key={i}>
                Line {err.line}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
