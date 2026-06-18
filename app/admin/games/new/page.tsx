import Link from "next/link";
import GameForm from "@/components/admin/GameForm";
import { createGame } from "@/app/admin/actions";

interface NewGamePageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewGamePage({ searchParams }: NewGamePageProps) {
  const { error } = await searchParams;

  return (
    <div className="admin-edit">
      <Link href="/admin/games" className="admin-back">
        ← Back to games
      </Link>
      <h2 className="admin-section-title">Add game</h2>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      <GameForm action={createGame} submitLabel="Create game" />
    </div>
  );
}
