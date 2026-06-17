"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { signOut } from "@/app/auth/actions";
import "./NavRail.css";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3 3h8v10H3zm0 12h8v6H3zm10 0h8V11h-8zm0-12v6h8V3z" />
      </svg>
    ),
  },
  {
    href: "/games",
    label: "Library",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z" />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "Search",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="18.5" y1="18.5" x2="22" y2="22" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    ),
  },
];

const LOGIN_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

const LOGOUT_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function NavRail() {
  const pathname = usePathname();
  const activeIndex = NAV_ITEMS.findIndex((item) => item.href === pathname);
  const loginActive = pathname === "/login" || pathname === "/register";

  // Auth-state (client-side) — bepaalt login- vs logout-actie.
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <>
      {/* Desktop: vertical nav rail met sliding indicator */}
      <nav className="nav-rail" aria-label="Main navigation">
        <div className="nav-rail-logo" aria-hidden="true">
          <span className="nav-rail-logo-mark">▶</span>
        </div>

        <div
          className="nav-rail-list-wrap"
          style={
            activeIndex >= 0
              ? ({ "--nav-active-index": activeIndex } as React.CSSProperties)
              : undefined
          }
        >
          <div
            className={`nav-rail-indicator${activeIndex < 0 ? " nav-rail-indicator--hidden" : ""}`}
            aria-hidden="true"
          />

          <ul className="nav-rail-list" role="list">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`nav-item${isActive ? " nav-item--active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="nav-item-icon">{item.icon}</span>
                    <span className="nav-item-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom-pinned auth-actie */}
        <div className="nav-rail-foot">
          {authed ? (
            <form action={signOut}>
              <button type="submit" className="nav-item">
                <span className="nav-item-icon">{LOGOUT_ICON}</span>
                <span className="nav-item-label">Log out</span>
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className={`nav-item${loginActive ? " nav-rail-login--active" : ""}`}
              aria-current={loginActive ? "page" : undefined}
            >
              <span className="nav-item-icon">{LOGIN_ICON}</span>
              <span className="nav-item-label">Log in</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile: bottom tab bar */}
      <nav className="bottom-nav" aria-label="Main navigation">
        <ul className="bottom-nav-list" role="list">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className="bottom-nav-item-wrapper">
                <Link
                  href={item.href}
                  className={`bottom-nav-item${isActive ? " bottom-nav-item--active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="bottom-nav-icon">{item.icon}</span>
                  <span className="bottom-nav-label">{item.label}</span>
                </Link>
              </li>
            );
          })}

          <li className="bottom-nav-item-wrapper">
            {authed ? (
              <form action={signOut} className="bottom-nav-form">
                <button type="submit" className="bottom-nav-item">
                  <span className="bottom-nav-icon">{LOGOUT_ICON}</span>
                  <span className="bottom-nav-label">Log out</span>
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className={`bottom-nav-item${loginActive ? " bottom-nav-item--active" : ""}`}
                aria-current={loginActive ? "page" : undefined}
              >
                <span className="bottom-nav-icon">{LOGIN_ICON}</span>
                <span className="bottom-nav-label">Log in</span>
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </>
  );
}
