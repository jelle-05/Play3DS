import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReviewCard from "@/components/ReviewCard/ReviewCard";
import ReviewComments from "@/components/ReviewComments/ReviewComments";
import { getReviewById, getCommentsForReview } from "@/lib/reviews-db";
import { getSessionUser } from "@/lib/auth";
import "./page.css";

export const metadata: Metadata = {
  title: "Review",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [review, user] = await Promise.all([getReviewById(id), getSessionUser()]);
  if (!review) notFound();

  const comments = await getCommentsForReview(id);
  const isAdmin = user?.role === "admin";

  return (
    <div className="review-page">
      <Link href="/reviews" className="review-page__back">
        ← All reviews
      </Link>

      <ReviewCard review={review} canDelete={!!review.isOwner || isAdmin} />

      <ReviewComments
        reviewId={review.id}
        comments={comments}
        isLoggedIn={!!user}
        isAdmin={isAdmin}
      />
    </div>
  );
}
