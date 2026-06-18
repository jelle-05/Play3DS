import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GameDetailHero from "@/components/GameDetailHero/GameDetailHero";
import PlaythroughPanel from "@/components/PlaythroughPanel/PlaythroughPanel";
import ReviewCard from "@/components/ReviewCard/ReviewCard";
import { getCatalogGameBySlug } from "@/lib/catalog";
import { getReviewsForGameDb } from "@/lib/reviews-db";
import { getSessionUser } from "@/lib/auth";
import {
  getTimeEstimateForGame,
  getPlaythroughsForGame,
  formatMinutes,
} from "@/lib/playthroughs";
import "./page.css";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
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

export default async function GameDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { error } = await searchParams;
  const game = await getCatalogGameBySlug(slug);

  if (!game) notFound();

  // Playthrough-context + reviews uit de DB (op game-uuid; mock-fallback op slug).
  const reviewKey = process.env.NEXT_PUBLIC_SUPABASE_URL ? game.id : game.slug ?? game.id;
  const [session, estimate, playthroughs, reviews] = await Promise.all([
    getSessionUser(),
    getTimeEstimateForGame(game.id),
    getPlaythroughsForGame(game.id),
    getReviewsForGameDb(reviewKey),
  ]);

  const averagePlaytime = estimate?.mainMinutes
    ? `~${formatMinutes(estimate.mainMinutes)} (main story)`
    : game.averagePlaytime ?? null;

  const details: { label: string; value: string }[] = [
    { label: "Developer", value: game.developer ?? "Unknown" },
    { label: "Publisher", value: game.publisher ?? "Unknown" },
    { label: "Genre", value: game.genre },
    { label: "Release year", value: String(game.releaseYear) },
    { label: "Platform", value: game.platform },
    { label: "Average playtime", value: averagePlaytime ?? "Unknown" },
  ];

  return (
    <div className="game-detail-page">
      <GameDetailHero game={game} />

      {error && <p className="game-detail-error">{error}</p>}

      <PlaythroughPanel
        gameId={game.id}
        slug={game.slug ?? slug}
        isLoggedIn={!!session}
        estimate={estimate}
        playthroughs={playthroughs}
      />

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
          {!averagePlaytime && (
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
