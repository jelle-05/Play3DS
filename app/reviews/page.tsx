import type { Metadata } from "next";
import ReviewCard from "@/components/ReviewCard/ReviewCard";
import { getRecentReviews } from "@/lib/reviews-db";
import "./page.css";

export const metadata: Metadata = {
  title: "Reviews",
};

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await getRecentReviews();

  return (
    <div className="reviews-page">
      <header className="reviews-header">
        <div className="reviews-header__text">
          <h1 className="reviews-header__title">Reviews</h1>
          <p className="reviews-header__sub">
            What the community is playing and finishing on 3DS.
          </p>
        </div>
        <span className="pill pill-surface">{reviews.length} reviews</span>
      </header>

      {reviews.length === 0 ? (
        <p className="reviews-empty">
          No reviews yet. Be the first — open a game and share your thoughts.
        </p>
      ) : (
        <div className="reviews-grid">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
