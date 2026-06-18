"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { reviewStatusLabel, type Review } from "@/lib/reviews";
import { deleteReview, toggleReviewLike } from "@/app/reviews/actions";
import "./ReviewCard.css";

interface ReviewCardProps {
  review: Review;
  // Hide the game context row when the card is already shown on that game's page.
  showGame?: boolean;
  // Toon een verwijderknop (eigenaar of admin) — gebruikt op de reviewlijsten.
  canDelete?: boolean;
}

function scoreTier(rating: number): "high" | "mid" | "low" {
  if (rating >= 8) return "high";
  if (rating >= 6) return "mid";
  return "low";
}

export default function ReviewCard({ review, showGame = true, canDelete = false }: ReviewCardProps) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [liked, setLiked] = useState(review.likedByMe ?? false);
  const [likeCount, setLikeCount] = useState(review.likes);
  const [pending, startTransition] = useTransition();

  const spoilerHidden = review.hasSpoilers && !revealed;

  function handleLike() {
    // Optimistisch togglen; de server hertelt en router.refresh haalt de waarheid.
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
    startTransition(async () => {
      await toggleReviewLike(review.id);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Delete this review?")) return;
    startTransition(async () => {
      await deleteReview(review.id);
      router.refresh();
    });
  }

  return (
    <article className="review-card">
      {/* Header: author + score */}
      <header className="review-card__header">
        <div className="review-card__author">
          <span className="review-card__avatar" aria-hidden="true">
            {review.authorInitials}
          </span>
          <div className="review-card__author-meta">
            <span className="review-card__author-name">{review.author}</span>
            <span className="review-card__time">{review.relativeTime}</span>
          </div>
        </div>
        <div
          className={`review-card__score review-card__score--${scoreTier(
            review.rating
          )}`}
        >
          <span className="review-card__score-value">{review.rating}</span>
          <span className="review-card__score-max">/10</span>
        </div>
      </header>

      {/* Game context + status label */}
      <div className="review-card__tags">
        {showGame && (
          <Link
            href={`/games/${review.gameId}`}
            className="review-card__game"
          >
            <span className={`review-card__game-dot ${review.gradientClass}`} />
            {review.gameTitle}
          </Link>
        )}
        <span className={`pill pill-${review.status}`}>
          {reviewStatusLabel(review.status)}
        </span>
      </div>

      {/* Title + body (body blurred when it contains spoilers) */}
      <h3 className="review-card__title">{review.title}</h3>

      <div className="review-card__body">
        <p
          className={`review-card__text${
            spoilerHidden ? " review-card__text--spoiler" : ""
          }`}
        >
          {review.body}
        </p>
        {spoilerHidden && (
          <button
            type="button"
            className="review-card__spoiler-btn"
            onClick={() => setRevealed(true)}
          >
            ⚠ Contains spoilers — tap to reveal
          </button>
        )}
      </div>

      {/* Footer: meta pills + actions */}
      <footer className="review-card__footer">
        <div className="review-card__meta">
          {review.playtimeAtReview && (
            <span className="pill pill-surface">▶ {review.playtimeAtReview}</span>
          )}
          {review.goalType && (
            <span className="pill pill-surface">{review.goalType}</span>
          )}
        </div>
        <div className="review-card__actions">
          <button
            type="button"
            className={`review-card__action${
              liked ? " review-card__action--liked" : ""
            }`}
            aria-pressed={liked}
            aria-label={liked ? "Unlike review" : "Like review"}
            onClick={handleLike}
          >
            <span aria-hidden="true">{liked ? "♥" : "♡"}</span> {likeCount}
          </button>
          <Link
            href={`/reviews/${review.id}`}
            className="review-card__action review-card__action--link"
            aria-label="View comments"
          >
            <span aria-hidden="true">💬</span> {review.comments}
          </Link>
          {canDelete && (
            <button
              type="button"
              className="review-card__action review-card__delete"
              onClick={handleDelete}
              disabled={pending}
            >
              {pending ? "…" : "Delete"}
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
