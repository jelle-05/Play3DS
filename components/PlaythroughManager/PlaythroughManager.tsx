"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addPlaytime,
  updatePlaythroughStatus,
  setManualProgress,
  addPlaythroughNote,
  deletePlaythrough,
} from "@/app/playthroughs/actions";
import { STATUS_LABELS, type PlaythroughStatus } from "@/lib/playthrough-types";
import "./PlaythroughManager.css";

interface PlaythroughManagerProps {
  id: string;
  status: PlaythroughStatus;
  manualProgress: number | null;
}

const STATUS_ORDER: PlaythroughStatus[] = [
  "want_to_play",
  "playing",
  "paused",
  "completed",
  "dropped",
];

const TIME_OPTIONS = [
  { label: "+30m", minutes: 30 },
  { label: "+1h", minutes: 60 },
  { label: "+2h", minutes: 120 },
];

export default function PlaythroughManager({
  id,
  status,
  manualProgress,
}: PlaythroughManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [progress, setProgress] = useState(manualProgress ?? 0);

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <div className="pt-manager">
      {/* Status */}
      <div className="pt-manager__block">
        <span className="pt-manager__label">Status</span>
        <div className="pt-manager__statuses">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              className={`pt-manager__status${s === status ? " pt-manager__status--active" : ""}`}
              onClick={() => run(() => updatePlaythroughStatus(id, s))}
              disabled={pending || s === status}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Add playtime */}
      <div className="pt-manager__block">
        <span className="pt-manager__label">Add playtime</span>
        <div className="pt-manager__times">
          {TIME_OPTIONS.map((t) => (
            <button
              key={t.label}
              type="button"
              className="pt-manager__time"
              onClick={() => run(() => addPlaytime(id, t.minutes))}
              disabled={pending}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual progress */}
      <div className="pt-manager__block">
        <span className="pt-manager__label">Manual progress: {progress}%</span>
        <div className="pt-manager__progress-row">
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="pt-manager__range"
            aria-label="Manual progress percent"
          />
          <button
            type="button"
            className="pt-manager__save"
            onClick={() => run(() => setManualProgress(id, progress))}
            disabled={pending}
          >
            Set
          </button>
        </div>
        <span className="pt-manager__hint">
          Overrides the estimate when the average playtime doesn&apos;t fit your run.
        </span>
      </div>

      {/* Note */}
      <div className="pt-manager__block">
        <span className="pt-manager__label">Add a note</span>
        <textarea
          className="pt-manager__note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Finished the 6th gym."
          maxLength={280}
        />
        <button
          type="button"
          className="pt-manager__save"
          onClick={() =>
            run(async () => {
              await addPlaythroughNote(id, note);
              setNote("");
            })
          }
          disabled={pending || note.trim() === ""}
        >
          Add note
        </button>
      </div>

      {/* Delete */}
      <div className="pt-manager__block pt-manager__danger">
        <button
          type="button"
          className="pt-manager__delete"
          onClick={() => {
            if (confirm("Delete this playthrough? This cannot be undone.")) {
              run(() => deletePlaythrough(id));
            }
          }}
          disabled={pending}
        >
          Delete playthrough
        </button>
      </div>
    </div>
  );
}
