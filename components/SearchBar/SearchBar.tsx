"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./SearchBar.css";

interface SearchBarProps {
  initialQuery?: string;
}

// Zoekbalk voor /search. Houdt de invoer in de URL (?q=...) zodat resultaten
// server-side worden opgehaald, deelbaar zijn en bij refresh behouden blijven.
// De navigatie is gedebounced zodat we niet bij elke toetsaanslag navigeren.
export default function SearchBar({ initialQuery = "" }: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  // Onthoud de laatst genavigeerde query om dubbele pushes te vermijden.
  const lastPushed = useRef(initialQuery);

  // Debounced URL-sync.
  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === lastPushed.current.trim()) return;

    const timer = setTimeout(() => {
      lastPushed.current = trimmed;
      const href = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search";
      router.replace(href, { scroll: false });
    }, 250);

    return () => clearTimeout(timer);
  }, [value, router]);

  // Focus de balk bij binnenkomst — search is een doelgerichte pagina.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="search-bar">
      <svg
        className="search-bar__icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="18.5" y1="18.5" x2="22" y2="22" />
      </svg>

      <input
        ref={inputRef}
        type="search"
        className="search-bar__input"
        placeholder="Search the 3DS library…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search games"
        autoComplete="off"
        enterKeyHint="search"
      />

      {value && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
