import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GameCard from "@/components/GameCard/GameCard";
import ReviewCard from "@/components/ReviewCard/ReviewCard";
import {
  getProfileByUsername,
  getProfileStats,
  getProfilePlaythroughCards,
} from "@/lib/profiles";
import { getReviewsForUserDb } from "@/lib/reviews-db";
import "./page.css";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${decodeURIComponent(username)}` };
}

// "Member since June 2026" — netjes geformatteerd, taalonafhankelijk vast op en-US.
function memberSince(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw);

  const profile = await getProfileByUsername(username);
  // Niet gevonden, of een privéprofiel van iemand anders (RLS geeft dan niets terug).
  if (!profile) notFound();

  const [stats, playthroughs, reviews] = await Promise.all([
    getProfileStats(profile.userId),
    getProfilePlaythroughCards(profile.userId),
    getReviewsForUserDb(profile.userId),
  ]);

  const since = memberSince(profile.createdAt);

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-hero glass-panel">
        <div className={`profile-hero__avatar ${profile.gradientClass}`}>
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="profile-hero__avatar-img"
              src={profile.avatarUrl}
              alt={profile.username}
            />
          ) : (
            <span aria-hidden="true">{profile.initials}</span>
          )}
        </div>

        <div className="profile-hero__main">
          <div className="profile-hero__name-row">
            <h1 className="profile-hero__name">{profile.username}</h1>
            {profile.role === "admin" && (
              <span className="pill pill-primary">Admin</span>
            )}
            {profile.isOwner && profile.visibility === "private" && (
              <span className="pill pill-surface">Private</span>
            )}
          </div>

          {profile.bio ? (
            <p className="profile-hero__bio">{profile.bio}</p>
          ) : (
            profile.isOwner && (
              <p className="profile-hero__bio profile-hero__bio--empty">
                You haven&apos;t added a bio yet.
              </p>
            )
          )}

          <div className="profile-hero__meta">
            {profile.country && (
              <span className="profile-hero__meta-item">📍 {profile.country}</span>
            )}
            {since && (
              <span className="profile-hero__meta-item">
                🗓 Member since {since}
              </span>
            )}
          </div>

          {profile.isOwner && (
            <div className="profile-hero__actions">
              <Link href="/settings/profile" className="profile-hero__btn">
                Edit profile
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat__value">{stats.playthroughs}</span>
            <span className="profile-stat__label">Tracked</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__value">{stats.completed}</span>
            <span className="profile-stat__label">Completed</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__value">{stats.reviews}</span>
            <span className="profile-stat__label">Reviews</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__value">{stats.followers}</span>
            <span className="profile-stat__label">Followers</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__value">{stats.following}</span>
            <span className="profile-stat__label">Following</span>
          </div>
        </div>
      </header>

      {/* Playthroughs */}
      <section className="profile-section">
        <div className="profile-section__header">
          <h2 className="profile-section__title">
            {profile.isOwner ? "Your library" : "Public library"}
          </h2>
        </div>
        {playthroughs.length === 0 ? (
          <p className="profile-empty">
            {profile.isOwner
              ? "You're not tracking any games yet."
              : "No public playthroughs yet."}
          </p>
        ) : (
          <div className="profile-grid">
            {playthroughs.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                variant="compact"
                href={`/games/${game.slug ?? game.id}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="profile-section">
        <div className="profile-section__header">
          <h2 className="profile-section__title">Reviews</h2>
        </div>
        {reviews.length === 0 ? (
          <p className="profile-empty">
            {profile.isOwner
              ? "You haven't written any reviews yet."
              : "No public reviews yet."}
          </p>
        ) : (
          <div className="profile-reviews">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                showGame
                canDelete={review.isOwner}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
