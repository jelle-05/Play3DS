"use client";

import { useEffect, useState } from "react";
import "./ThemeToggle.css";

type Theme = "light" | "dark";

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  // Sync the icon with whatever the no-flash script already applied.
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as Theme | null;
    if (current) {
      setTheme(current);
    } else {
      setTheme(
        window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      );
    }
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore storage errors (private mode etc.) */
    }
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title="Toggle theme"
    >
      {/* Render nothing until mounted to avoid a wrong-icon flash */}
      {theme === null ? null : isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
