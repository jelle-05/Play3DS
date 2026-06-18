"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import ReviewCard from "@/components/ReviewCard/ReviewCard";
import { createReview, updateReview, deleteReview } from "@/app/reviews/actions";
import { reviewStatusLabel, type Review, type ReviewStatus } from "@/lib/reviews";
import "./ReviewComposer.css";

interface ReviewComposerProps {
  gameId: string; // game-uuid
  slug: string;
  isLoggedIn: boolean;
  myReview: Review | null;
}

const STATUSES: ReviewStatus[] = ["playing", "completed", "paused", "dropped"];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="review-form__submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}

function ReviewForm({
  action,
  gameId,
  slug,
  review,
  onCancel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  gameId: string;
  slug: string;
  review?: Review | null;
  onCancel?: () => void;
}) {
  return (
    <form action={action} className="review-form">
      {review ? (
        <input type="hidden" name="review_id" value={review.id} />
      ) : (
        <input type="hidden" name="game_id" value={gameId} />
      )}
      <input type="hidden" name="slug" value={slug} />

      <div className="review-form__row">
        <label className="review-form__field review-form__field--sm">
          <span className="review-form__label">Score</span>
          <select name="rating" defaultValue={review?.rating ?? 8} className="review-form__input">
            {Array.from({ length: 10 }, (_, i) => 10 - i).map((n) => (
              <option key={n} value={n}>
                {n}/10
              </option>
            ))}
          </select>
        </label>

        <label className="review-form__field review-form__field--sm">
          <span className="review-form__label">Status</span>
          <select
            name="status"
            defaultValue={review?.status ?? "completed"}
            className="review-form__input"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {reviewStatusLabel(s)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="review-form__field">
        <span className="review-form__label">Title (optional)</span>
        <input
          name="title"
          defaultValue={review?.title ?? ""}
          className="review-form__input"
          maxLength={120}
          placeholder="A short headline"
        />
      </label>

      <label className="review-form__field">
        <span className="review-form__label">Your review</span>
        <textarea
          name="body"
          defaultValue={review?.body ?? ""}
          className="review-form__input review-form__textarea"
          rows={5}
          required
          maxLength={4000}
          placeholder="What did you think?"
        />
      </label>

      <label className="review-form__check">
        <input type="checkbox" name="has_spoilers" defaultChecked={review?.hasSpoilers ?? false} />
        <span>Contains spoilers</span>
      </label>

      <div className="review-form__actions">
        <SubmitButton label={review ? "Save changes" : "Post review"} />
        {onCancel && (
          <button type="button" className="review-form__cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function ReviewComposer({
  gameId,
  slug,
  isLoggedIn,
  myReview,
}: ReviewComposerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  if (!isLoggedIn) {
    return (
      <p className="review-composer__signin">
        <Link href="/login" className="review-composer__link">
          Log in
        </Link>{" "}
        to write a review.
      </p>
    );
  }

  const createAction = async (fd: FormData) => {
    await createReview(fd);
    setOpen(false);
    router.refresh();
  };

  const editAction = async (fd: FormData) => {
    await updateReview(fd);
    setEditing(false);
    router.refresh();
  };

  async function handleDelete() {
    if (!myReview) return;
    if (!confirm("Delete your review?")) return;
    await deleteReview(myReview.id);
    router.refresh();
  }

  // Bestaande review → tonen met bewerken/verwijderen, of het edit-formulier.
  if (myReview) {
    if (editing) {
      return (
        <ReviewForm
          action={editAction}
          gameId={gameId}
          slug={slug}
          review={myReview}
          onCancel={() => setEditing(false)}
        />
      );
    }
    return (
      <div className="review-composer__mine">
        <ReviewCard review={myReview} showGame={false} />
        <div className="review-composer__mine-actions">
          <button type="button" className="review-composer__btn" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button
            type="button"
            className="review-composer__btn review-composer__btn--danger"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  // Nog geen review → knop die het formulier opent.
  if (!open) {
    return (
      <button type="button" className="review-composer__cta" onClick={() => setOpen(true)}>
        ✍ Write a review
      </button>
    );
  }

  return (
    <ReviewForm
      action={createAction}
      gameId={gameId}
      slug={slug}
      onCancel={() => setOpen(false)}
    />
  );
}
