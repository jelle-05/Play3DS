import type { Metadata } from "next";
import SearchBar from "@/components/SearchBar/SearchBar";
import GameGrid from "@/components/GameGrid/GameGrid";
import { searchCatalogGames } from "@/lib/catalog";
import "./page.css";

export const metadata: Metadata = {
  title: "Search",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchCatalogGames(query) : [];

  return (
    <div className="search-page">
      <header className="search-page__header">
        <h1 className="search-page__title">Search</h1>
        <p className="search-page__sub">Find any game in the Nintendo 3DS library.</p>
        <div className="search-page__bar">
          <SearchBar initialQuery={query} />
        </div>
      </header>

      {query ? (
        results.length > 0 ? (
          <>
            <p className="search-page__count">
              {results.length} {results.length === 1 ? "result" : "results"} for{" "}
              <span className="search-page__term">“{query}”</span>
            </p>
            <GameGrid games={results} hideTitle />
          </>
        ) : (
          <div className="search-page__empty">
            <p className="search-page__empty-title">
              No games found for <span className="search-page__term">“{query}”</span>
            </p>
            <p className="search-page__empty-hint">
              Try a different spelling, a shorter term, or an alternative title.
            </p>
          </div>
        )
      ) : (
        <div className="search-page__empty">
          <p className="search-page__empty-title">Start typing to search</p>
          <p className="search-page__empty-hint">
            Search by title or alternative name — accents don&apos;t matter.
          </p>
        </div>
      )}
    </div>
  );
}
