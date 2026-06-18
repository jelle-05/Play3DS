"use client";

import { useState } from "react";
import { syncIgdbPage } from "@/app/admin/igdb/actions";

interface Totals {
  pages: number;
  processed: number;
  created: number;
  updated: number;
  withTime: number;
}

const ZERO: Totals = { pages: 0, processed: 0, created: 0, updated: 0, withTime: 0 };
const MAX_PAGES = 20; // vangnet: 20 × 500 = 10.000 games

export default function IgdbSync() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState<Totals>(ZERO);

  async function start() {
    setRunning(true);
    setDone(false);
    setError(null);
    setTotals(ZERO);

    let offset = 0;
    const acc: Totals = { ...ZERO };

    for (let i = 0; i < MAX_PAGES; i++) {
      let res;
      try {
        res = await syncIgdbPage(offset);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sync failed.");
        break;
      }

      if (!res.ok) {
        setError(res.error ?? "Sync failed.");
        break;
      }

      acc.pages += 1;
      acc.processed += res.processed;
      acc.created += res.created;
      acc.updated += res.updated;
      acc.withTime += res.withTime;
      setTotals({ ...acc });

      if (res.done) {
        setDone(true);
        break;
      }
      offset = res.nextOffset;
    }

    setRunning(false);
  }

  return (
    <div className="admin-igdb">
      <button
        type="button"
        className="admin-btn admin-btn--primary"
        onClick={start}
        disabled={running}
      >
        {running ? "Syncing…" : "Start IGDB sync"}
      </button>

      {(running || totals.pages > 0) && (
        <div className="admin-igdb__progress">
          <div className="admin-stats admin-stats--compact">
            <div className="admin-stat">
              <span className="admin-stat__num">{totals.processed}</span>
              <span className="admin-stat__label">Processed</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat__num">{totals.created}</span>
              <span className="admin-stat__label">New</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat__num">{totals.updated}</span>
              <span className="admin-stat__label">Updated</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat__num">{totals.withTime}</span>
              <span className="admin-stat__label">With playtime</span>
            </div>
          </div>
          <p className="admin-field__hint">
            {running
              ? `Fetching page ${totals.pages + 1}…`
              : done
                ? "Sync complete."
                : "Stopped."}
          </p>
        </div>
      )}

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {done && !error && (
        <div className="admin-alert admin-alert--success">
          Done — {totals.created} new, {totals.updated} updated, {totals.withTime} with
          playtime estimates across {totals.pages} page(s).
        </div>
      )}
    </div>
  );
}
