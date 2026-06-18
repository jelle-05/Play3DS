"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addComment, deleteComment } from "@/app/reviews/actions";
import type { ReviewComment } from "@/lib/reviews";
import "./ReviewComments.css";

interface ReviewCommentsProps {
  reviewId: string;
  comments: ReviewComment[];
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export default function ReviewComments({
  reviewId,
  comments,
  isLoggedIn,
  isAdmin,
}: ReviewCommentsProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    const text = body.trim();
    if (!text) return;
    startTransition(async () => {
      await addComment(reviewId, text);
      setBody("");
      router.refresh();
    });
  }

  function remove(commentId: string) {
    if (!confirm("Delete this comment?")) return;
    startTransition(async () => {
      await deleteComment(commentId, reviewId);
      router.refresh();
    });
  }

  return (
    <div className="review-comments">
      <h2 className="feed-section-title">
        Comments <span className="review-comments__count">{comments.length}</span>
      </h2>

      {comments.length > 0 ? (
        <ul className="review-comments__list">
          {comments.map((c) => (
            <li key={c.id} className="comment">
              <span className="comment__avatar" aria-hidden="true">
                {c.authorInitials}
              </span>
              <div className="comment__main">
                <div className="comment__meta">
                  <span className="comment__author">{c.author}</span>
                  <span className="comment__time">{c.relativeTime}</span>
                  {(c.isOwner || isAdmin) && (
                    <button
                      type="button"
                      className="comment__delete"
                      onClick={() => remove(c.id)}
                      disabled={pending}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="comment__body">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="review-comments__empty">No comments yet.</p>
      )}

      {isLoggedIn ? (
        <div className="review-comments__add">
          <textarea
            className="review-comments__input"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment…"
            maxLength={2000}
          />
          <button
            type="button"
            className="review-comments__submit"
            onClick={submit}
            disabled={pending || body.trim() === ""}
          >
            {pending ? "Posting…" : "Post comment"}
          </button>
        </div>
      ) : (
        <p className="review-comments__signin">
          <Link href="/login" className="review-comments__link">
            Log in
          </Link>{" "}
          to comment.
        </p>
      )}
    </div>
  );
}
