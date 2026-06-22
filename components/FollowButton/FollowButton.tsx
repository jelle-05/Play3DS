"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { followUser, unfollowUser } from "@/app/users/actions";
import "./FollowButton.css";

interface FollowButtonProps {
  targetUserId: string;
  username: string;
  isLoggedIn: boolean;
  initialFollowing: boolean;
}

export default function FollowButton({
  targetUserId,
  username,
  isLoggedIn,
  initialFollowing,
}: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  // Niet ingelogd → uitnodiging om in te loggen (geen actie mogelijk).
  if (!isLoggedIn) {
    return (
      <Link href="/login" className="follow-btn follow-btn--guest">
        Follow
      </Link>
    );
  }

  function handleClick() {
    // Optimistisch togglen; de server is de waarheid (router.refresh hertelt).
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      if (next) {
        await followUser(targetUserId, username);
      } else {
        await unfollowUser(targetUserId, username);
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      className={`follow-btn${following ? " follow-btn--following" : ""}`}
      aria-pressed={following}
      onClick={handleClick}
      disabled={pending}
    >
      {following ? (
        <>
          <span aria-hidden="true">✓</span> Following
        </>
      ) : (
        <>
          <span aria-hidden="true">＋</span> Follow
        </>
      )}
    </button>
  );
}
