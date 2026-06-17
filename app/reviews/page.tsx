import type { Metadata } from "next";
import ReviewCard from "@/components/ReviewCard/ReviewCard";
import { MOCK_REVIEWS } from "@/lib/reviews";
import "./page.css";

export const metadata: Metadata = {
  title: "Reviews",
};

export default function ReviewsPage() {
  const reviews = MOCK_REVIEWS;

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

      <div className="reviews-grid">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
