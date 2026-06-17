import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GameDetailHero from "@/components/GameDetailHero/GameDetailHero";
import ReviewCard from "@/components/ReviewCard/ReviewCard";
import { getCatalogGameBySlug } from "@/lib/catalog";
import { getReviewsForGame } from "@/lib/reviews";
import "./page.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getCatalogGameBySlug(slug);
  if (!game) return { title: "Game not found" };
  return {
    title: game.title,
    description: game.description ?? `Track your ${game.title} playthrough.`,
  };
}

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const game = await getCatalogGameBySlug(slug);

  if (!game) notFound();

  // Reviews matchen (voorlopig mock) op slug.
  const reviews = getReviewsForGame(game.slug ?? game.id);

  const details: { label: string; value: string }[] = [
    { label: "Developer", value: game.developer ?? "Unknown" },
    { label: "Publisher", value: game.publisher ?? "Unknown" },
    { label: "Genre", value: game.genre },
    { label: "Release year", value: String(game.releaseYear) },
    { label: "Platform", value: game.platform },
    { label: "Average playtime", value: game.averagePlaytime ?? "Unknown" },
  ];

  return (
    <div className="game-detail-page">
      <GameDetailHero game={game} />

      <div className="game-detail-body">
        {/* About */}
        <section className="game-detail-section">
          <h2 className="feed-section-title">About</h2>
          <p className="game-detail-about">
            {game.description ??
              "No description yet for this game. You can still track your own playtime and progress."}
          </p>
        </section>

        {/* Details */}
        <section className="game-detail-section">
          <h2 className="feed-section-title">Details</h2>
          <dl className="game-detail-grid">
            {details.map((d) => (
              <div key={d.label} className="game-detail-grid__row">
                <dt className="game-detail-grid__label">{d.label}</dt>
                <dd className="game-detail-grid__value">{d.value}</dd>
              </div>
            ))}
          </dl>
          {!game.averagePlaytime && (
            <p className="game-detail-note">
              Average playtime unknown. You can still track your own playtime and
              set progress manually.
            </p>
          )}
        </section>
      </div>

      {/* Reviews for this game */}
      {reviews.length > 0 && (
        <section className="game-detail-reviews">
          <div className="game-detail-reviews__header">
            <h2 className="feed-section-title">Reviews</h2>
            <span className="pill pill-surface">{reviews.length}</span>
          </div>
          <div className="game-detail-reviews__grid">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} showGame={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
